package com.example.festival.tradechat.service;

import com.example.festival.chat.redis.ChatRedisPublisher;
import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import com.example.festival.notification.service.NotificationService;
import com.example.festival.tradechat.dto.TradeChatImageUploadResponse;
import com.example.festival.tradechat.dto.TradeChatMessageDto;
import com.example.festival.tradechat.dto.TradeChatPresenceEvent;
import com.example.festival.tradechat.dto.TradeChatReadEvent;
import com.example.festival.tradechat.dto.TradeChatRoomDto;
import com.example.festival.tradechat.dto.TradeChatRoomListItemDto;
import com.example.festival.tradechat.dto.TradeChatWarningEvent;
import com.example.festival.tradechat.entity.TradeChatMessage;
import com.example.festival.tradechat.entity.TradeChatRoom;
import com.example.festival.tradechat.repository.TradeChatMessageRepository;
import com.example.festival.tradechat.repository.TradeChatRoomRepository;
import com.example.festival.usedtrade.entity.UsedListing;
import com.example.festival.usedtrade.entity.UsedTransaction;
import com.example.festival.usedtrade.repository.UsedListingRepository;
import com.example.festival.usedtrade.repository.UsedTransactionRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * 중고거래(usedtrade) 매물 + 구매자 한 쌍당 1:1 실시간 채팅. 구매요청(UsedTransaction) 없이도 매물 상세에서 바로 시작할 수 있다.
 * WebSocket 브로드캐스트는 오픈챗이 쓰는 {@link ChatRedisPublisher}를 그대로 재사용한다(범용 destination 기반).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TradeChatService {

    private static final String IMAGE_SUBDIR = "tradechat";
    private static final List<String> ALLOWED_IMAGE_CONTENT_TYPES =
            List.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final String MESSAGE_TYPE_TEXT = "TEXT";
    private static final String MESSAGE_TYPE_IMAGE = "IMAGE";
    private static final String NOTIFICATION_TYPE_NEW_MESSAGE = "TRADE_CHAT_MESSAGE";
    private static final int NOTIFICATION_PREVIEW_MAX_LENGTH = 80;

    private final TradeChatRoomRepository tradeChatRoomRepository;
    private final TradeChatMessageRepository tradeChatMessageRepository;
    private final UsedListingRepository usedListingRepository;
    private final UsedTransactionRepository usedTransactionRepository;
    private final MemberRepository memberRepository;
    private final ChatRedisPublisher chatRedisPublisher;
    private final TradeChatPresenceRegistry presenceRegistry;
    private final TradeChatModerationService moderationService;
    private final NotificationService notificationService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    /**
     * 매물 상세의 "채팅하기" 버튼 — 구매 요청 없이 바로 판매자와의 채팅방을 만들거나 연다.
     */
    @Transactional
    public TradeChatRoomDto getOrCreateRoomByListing(Long listingId, Long buyerId) {
        UsedListing listing = usedListingRepository.findById(listingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "매물을 찾을 수 없습니다."));

        if (listing.getSeller().getId().equals(buyerId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "본인 매물에는 채팅을 시작할 수 없어요.");
        }

        TradeChatRoom room = tradeChatRoomRepository.findByListingIdAndBuyerIdWithDetails(listingId, buyerId)
                .orElseGet(() -> {
                    Member buyer = memberRepository.findById(buyerId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));
                    return tradeChatRoomRepository.save(new TradeChatRoom(listing, buyer));
                });

        return toRoomDto(room, buyerId);
    }

    /**
     * 구매요청 목록 화면 등 transactionId를 들고 있는 기존 화면용. 매물+구매자 방을 찾거나 만들고, 이 거래를 방에 연결한다.
     */
    @Transactional
    public TradeChatRoomDto getOrCreateRoom(Long transactionId, Long requesterId) {
        UsedTransaction transaction = usedTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "거래를 찾을 수 없습니다."));

        boolean isBuyer = transaction.getBuyer().getId().equals(requesterId);
        boolean isSeller = transaction.getListing().getSeller().getId().equals(requesterId);
        if (!isBuyer && !isSeller) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이 거래의 채팅방에 접근할 수 없어요.");
        }

        TradeChatRoom room = tradeChatRoomRepository
                .findByListingIdAndBuyerIdWithDetails(transaction.getListing().getListingId(), transaction.getBuyer().getId())
                .orElseGet(() -> tradeChatRoomRepository.save(new TradeChatRoom(transaction.getListing(), transaction.getBuyer())));

        if (room.getTransaction() == null) {
            room.linkTransaction(transaction);
        }

        return toRoomDto(room, requesterId);
    }

    public TradeChatRoomDto getRoom(Long roomId, Long requesterId) {
        TradeChatRoom room = getRoomOrThrow(roomId);
        requireParticipant(room, requesterId);
        return toRoomDto(room, requesterId);
    }

    /**
     * 히스토리 조회와 동시에, 상대방이 보낸 안읽은 메시지를 전부 읽음 처리한다(방을 여는 것 자체가 "읽음").
     */
    @Transactional
    public List<TradeChatMessageDto> getHistory(Long roomId, Long requesterId) {
        TradeChatRoom room = getRoomOrThrow(roomId);
        requireParticipant(room, requesterId);

        List<TradeChatMessage> unread =
                tradeChatMessageRepository.findByRoom_RoomIdAndSender_IdNotAndReadFalse(roomId, requesterId);
        if (!unread.isEmpty()) {
            Long upToMessageId = unread.stream().map(TradeChatMessage::getMessageId).max(Long::compareTo).orElse(null);
            unread.forEach(TradeChatMessage::markRead);
            chatRedisPublisher.publish("/topic/trade-chat-rooms/" + roomId + "/read",
                    new TradeChatReadEvent(roomId, requesterId, upToMessageId));
        }

        return tradeChatMessageRepository.findRecentByRoomId(roomId, PageRequest.of(0, 100)).stream()
                .sorted(Comparator.comparing(TradeChatMessage::getCreatedAt).thenComparing(TradeChatMessage::getMessageId))
                .map(this::toMessageDto)
                .toList();
    }

    @Transactional
    public void send(Long roomId, Long senderId, String rawMessage, String messageType) {
        String trimmed = rawMessage == null ? "" : rawMessage.trim();
        if (trimmed.isEmpty()) {
            return;
        }

        TradeChatRoom room = getRoomOrThrow(roomId);
        requireParticipant(room, senderId);
        if (room.isBlocked()) {
            return;
        }

        Member sender = memberRepository.findById(senderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));

        String type = MESSAGE_TYPE_IMAGE.equals(messageType) ? MESSAGE_TYPE_IMAGE : MESSAGE_TYPE_TEXT;
        TradeChatMessage message = new TradeChatMessage(room, sender, type, trimmed);
        tradeChatMessageRepository.save(message);

        TradeChatMessageDto dto = toMessageDto(message);
        chatRedisPublisher.publish("/topic/trade-chat-rooms/" + roomId, dto);
        notifyRecipientIfAway(room, sender, type, trimmed);

        if (MESSAGE_TYPE_TEXT.equals(type) && moderationService.isSuspicious(trimmed)) {
            chatRedisPublisher.publish("/topic/trade-chat-rooms/" + roomId + "/warning",
                    new TradeChatWarningEvent(roomId, message.getMessageId(), TradeChatModerationService.WARNING_TEXT));
        }
    }

    public void enterRoom(Long roomId, Long memberId) {
        TradeChatRoom room = getRoomOrThrow(roomId);
        requireParticipant(room, memberId);
        if (presenceRegistry.enter(roomId, memberId)) {
            chatRedisPublisher.publish("/topic/trade-chat-rooms/" + roomId + "/presence",
                    new TradeChatPresenceEvent(roomId, memberId, true));
        }
    }

    public void exitRoom(Long roomId, Long memberId) {
        if (presenceRegistry.exit(roomId, memberId)) {
            chatRedisPublisher.publish("/topic/trade-chat-rooms/" + roomId + "/presence",
                    new TradeChatPresenceEvent(roomId, memberId, false));
        }
    }

    @Transactional
    public void block(Long roomId, Long actingMemberId) {
        TradeChatRoom room = getRoomOrThrow(roomId);
        requireParticipant(room, actingMemberId);
        Member actingMember = memberRepository.findById(actingMemberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));
        room.block(actingMember);
    }

    @Transactional
    public void unblock(Long roomId, Long actingMemberId) {
        TradeChatRoom room = getRoomOrThrow(roomId);
        requireParticipant(room, actingMemberId);
        if (room.getBlockedBy() == null || !room.getBlockedBy().getId().equals(actingMemberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "차단을 건 본인만 해제할 수 있어요.");
        }
        room.unblock();
    }

    @Transactional
    public TradeChatImageUploadResponse uploadChatImage(Long memberId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일을 선택해주세요.");
        }
        if (!ALLOWED_IMAGE_CONTENT_TYPES.contains(file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "jpg, png, webp, gif 이미지만 업로드할 수 있어요.");
        }

        try {
            Path uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
            Path targetDir = uploadRoot.resolve(IMAGE_SUBDIR);
            Files.createDirectories(targetDir);

            String extension = extractExtension(file.getOriginalFilename());
            String fileName = memberId + "_" + UUID.randomUUID() + extension;
            Path targetPath = targetDir.resolve(fileName).normalize();

            file.transferTo(targetPath);
            return new TradeChatImageUploadResponse("/uploads/" + IMAGE_SUBDIR + "/" + fileName);
        } catch (IOException e) {
            throw new UncheckedIOException("채팅 이미지 저장에 실패했습니다.", e);
        }
    }

    /**
     * 마이페이지 구매요청 목록 화면에서 방별 안읽은 수를 한 번에 보여주기 위한 조회.
     * 방은 이제 (매물, 구매자) 기준이라, 같은 방에 걸린 구매요청이 여러 건이면 전부 같은 안읽은 수를 받는다.
     */
    public Map<Long, Long> getUnreadCounts(Long memberId) {
        Map<Long, Long> result = new LinkedHashMap<>();
        for (TradeChatMessageRepository.UnreadCountRow row : tradeChatMessageRepository.countUnreadByMember(memberId)) {
            result.put(row.getTransactionId(), row.getCount());
        }
        return result;
    }

    /**
     * "나의 채팅" 목록 — 구매자/판매자로 참여 중인 채팅방을 전부 모아서
     * 마지막 메시지 미리보기, 안읽은 수, 상대 온라인 여부를 붙여 최근 활동순으로 반환한다.
     */
    public List<TradeChatRoomListItemDto> listMyRooms(Long memberId) {
        List<TradeChatRoomListItemDto> items = new ArrayList<>();
        for (TradeChatRoom room : tradeChatRoomRepository.findAllByMemberWithDetails(memberId)) {
            items.add(toListItemDto(room, memberId));
        }

        items.sort(Comparator.comparing(
                TradeChatRoomListItemDto::lastMessageAt,
                Comparator.nullsLast(Comparator.reverseOrder())
        ));
        return items;
    }

    private TradeChatRoomListItemDto toListItemDto(TradeChatRoom room, Long requesterId) {
        UsedListing listing = room.getListing();
        Member counterpart = resolveCounterpart(room, requesterId);

        TradeChatMessage lastMessage = tradeChatMessageRepository
                .findRecentByRoomId(room.getRoomId(), PageRequest.of(0, 1))
                .stream().findFirst().orElse(null);
        long unreadCount = tradeChatMessageRepository
                .countByRoom_RoomIdAndSender_IdNotAndReadFalse(room.getRoomId(), requesterId);

        boolean online = presenceRegistry.isOnline(room.getRoomId(), counterpart.getId());
        LocalDateTime lastSeenAt = online
                ? null
                : tradeChatMessageRepository.findLastMessageTimeBySender(room.getRoomId(), counterpart.getId());

        UsedTransaction transaction = room.getTransaction();

        return new TradeChatRoomListItemDto(
                room.getRoomId(),
                transaction != null ? transaction.getTransactionId() : null,
                counterpart.getId(),
                counterpart.getNickname(),
                counterpart.getProfileImage(),
                listing.getTitle(),
                firstImageUrl(listing),
                listing.getStatus(),
                transaction != null ? transaction.getStatus() : null,
                lastMessage != null ? lastMessage.getMessage() : null,
                lastMessage != null ? lastMessage.getMessageType() : null,
                lastMessage != null ? lastMessage.getCreatedAt() : null,
                unreadCount,
                online,
                lastSeenAt
        );
    }

    /**
     * 수신자가 지금 이 채팅방을 보고 있지 않을 때만 알림을 보낸다(보고 있으면 실시간으로 이미 보이니 중복 알림 방지).
     */
    private void notifyRecipientIfAway(TradeChatRoom room, Member sender, String messageType, String messageText) {
        Member recipient = resolveCounterpart(room, sender.getId());
        if (presenceRegistry.isOnline(room.getRoomId(), recipient.getId())) {
            return;
        }

        String listingTitle = room.getListing().getTitle();
        String preview = MESSAGE_TYPE_IMAGE.equals(messageType)
                ? sender.getNickname() + "님이 사진을 보냈어요"
                : sender.getNickname() + "님: " + truncate(messageText, NOTIFICATION_PREVIEW_MAX_LENGTH);

        notificationService.notifyMember(recipient.getId(), null, NOTIFICATION_TYPE_NEW_MESSAGE, listingTitle + " 채팅", preview);
    }

    private String truncate(String text, int maxLength) {
        return text.length() <= maxLength ? text : text.substring(0, maxLength) + "…";
    }

    private Member resolveCounterpart(TradeChatRoom room, Long requesterId) {
        boolean requesterIsBuyer = room.getBuyer().getId().equals(requesterId);
        return requesterIsBuyer ? room.getListing().getSeller() : room.getBuyer();
    }

    private String firstImageUrl(UsedListing listing) {
        return listing.getImageUrl() == null || listing.getImageUrl().isBlank()
                ? null
                : listing.getImageUrl().split(",")[0];
    }

    private TradeChatRoom getRoomOrThrow(Long roomId) {
        return tradeChatRoomRepository.findByIdWithDetails(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방을 찾을 수 없습니다."));
    }

    private void requireParticipant(TradeChatRoom room, Long memberId) {
        boolean isBuyer = room.getBuyer().getId().equals(memberId);
        boolean isSeller = room.getListing().getSeller().getId().equals(memberId);
        if (!isBuyer && !isSeller) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이 거래의 채팅방에 접근할 수 없어요.");
        }
    }

    private TradeChatRoomDto toRoomDto(TradeChatRoom room, Long requesterId) {
        UsedListing listing = room.getListing();
        Member counterpart = resolveCounterpart(room, requesterId);
        UsedTransaction transaction = room.getTransaction();

        boolean online = presenceRegistry.isOnline(room.getRoomId(), counterpart.getId());
        LocalDateTime lastSeenAt = online
                ? null
                : tradeChatMessageRepository.findLastMessageTimeBySender(room.getRoomId(), counterpart.getId());

        return new TradeChatRoomDto(
                room.getRoomId(),
                transaction != null ? transaction.getTransactionId() : null,
                transaction != null ? transaction.getStatus() : null,
                listing.getListingId(),
                listing.getTitle(),
                firstImageUrl(listing),
                listing.getStatus(),
                counterpart.getId(),
                counterpart.getNickname(),
                counterpart.getProfileImage(),
                room.isBlocked(),
                room.isBlocked() && room.getBlockedBy() != null && room.getBlockedBy().getId().equals(requesterId),
                online,
                lastSeenAt
        );
    }

    private TradeChatMessageDto toMessageDto(TradeChatMessage message) {
        Member sender = message.getSender();
        return new TradeChatMessageDto(
                message.getMessageId(),
                message.getRoom().getRoomId(),
                sender.getId(),
                sender.getNickname(),
                sender.getProfileImage(),
                message.getMessageType(),
                message.getMessage(),
                message.isRead(),
                message.getCreatedAt()
        );
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        int dotIndex = originalFilename.lastIndexOf('.');
        return dotIndex >= 0 ? originalFilename.substring(dotIndex) : "";
    }
}
