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
 * 중고거래(usedtrade) 구매요청 1건당 1개인 1:1 실시간 채팅.
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
    private final UsedTransactionRepository usedTransactionRepository;
    private final MemberRepository memberRepository;
    private final ChatRedisPublisher chatRedisPublisher;
    private final TradeChatPresenceRegistry presenceRegistry;
    private final TradeChatModerationService moderationService;
    private final NotificationService notificationService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Transactional
    public TradeChatRoomDto getOrCreateRoom(Long transactionId, Long requesterId) {
        UsedTransaction transaction = usedTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "거래를 찾을 수 없습니다."));

        requireParticipant(transaction, requesterId);

        TradeChatRoom room = tradeChatRoomRepository.findByTransactionIdWithDetails(transactionId)
                .orElseGet(() -> tradeChatRoomRepository.save(new TradeChatRoom(transaction)));

        return toRoomDto(room, requesterId);
    }

    public TradeChatRoomDto getRoom(Long roomId, Long requesterId) {
        TradeChatRoom room = getRoomOrThrow(roomId);
        requireParticipant(room.getTransaction(), requesterId);
        return toRoomDto(room, requesterId);
    }

    /**
     * 히스토리 조회와 동시에, 상대방이 보낸 안읽은 메시지를 전부 읽음 처리한다(방을 여는 것 자체가 "읽음").
     */
    @Transactional
    public List<TradeChatMessageDto> getHistory(Long roomId, Long requesterId) {
        TradeChatRoom room = getRoomOrThrow(roomId);
        requireParticipant(room.getTransaction(), requesterId);

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
        requireParticipant(room.getTransaction(), senderId);
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
        requireParticipant(room.getTransaction(), memberId);
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
        requireParticipant(room.getTransaction(), actingMemberId);
        Member actingMember = memberRepository.findById(actingMemberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));
        room.block(actingMember);
    }

    @Transactional
    public void unblock(Long roomId, Long actingMemberId) {
        TradeChatRoom room = getRoomOrThrow(roomId);
        requireParticipant(room.getTransaction(), actingMemberId);
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
     */
    public Map<Long, Long> getUnreadCounts(Long memberId) {
        Map<Long, Long> result = new LinkedHashMap<>();
        for (TradeChatMessageRepository.UnreadCountRow row : tradeChatMessageRepository.countUnreadByMember(memberId)) {
            result.put(row.getTransactionId(), row.getCount());
        }
        return result;
    }

    /**
     * "나의 채팅" 목록 — 구매자/판매자로 참여 중인 거래를 전부 모아서 채팅방(없으면 생성)과
     * 마지막 메시지 미리보기, 안읽은 수, 상대 온라인 여부를 붙여 최근 활동순으로 반환한다.
     */
    @Transactional
    public List<TradeChatRoomListItemDto> listMyRooms(Long memberId) {
        List<UsedTransaction> transactions = new ArrayList<>();
        transactions.addAll(usedTransactionRepository.findAllByBuyerIdWithListing(memberId));
        transactions.addAll(usedTransactionRepository.findAllBySellerIdWithListing(memberId));

        List<TradeChatRoomListItemDto> items = new ArrayList<>();
        for (UsedTransaction transaction : transactions) {
            TradeChatRoom room = tradeChatRoomRepository.findByTransactionIdWithDetails(transaction.getTransactionId())
                    .orElseGet(() -> tradeChatRoomRepository.save(new TradeChatRoom(transaction)));
            items.add(toListItemDto(room, memberId));
        }

        items.sort(Comparator.comparing(
                TradeChatRoomListItemDto::lastMessageAt,
                Comparator.nullsLast(Comparator.reverseOrder())
        ));
        return items;
    }

    private TradeChatRoomListItemDto toListItemDto(TradeChatRoom room, Long requesterId) {
        UsedTransaction transaction = room.getTransaction();
        UsedListing listing = transaction.getListing();
        Member counterpart = resolveCounterpart(transaction, requesterId);

        TradeChatMessage lastMessage = tradeChatMessageRepository
                .findRecentByRoomId(room.getRoomId(), PageRequest.of(0, 1))
                .stream().findFirst().orElse(null);
        long unreadCount = tradeChatMessageRepository
                .countByRoom_RoomIdAndSender_IdNotAndReadFalse(room.getRoomId(), requesterId);

        boolean online = presenceRegistry.isOnline(room.getRoomId(), counterpart.getId());
        LocalDateTime lastSeenAt = online
                ? null
                : tradeChatMessageRepository.findLastMessageTimeBySender(room.getRoomId(), counterpart.getId());

        return new TradeChatRoomListItemDto(
                room.getRoomId(),
                transaction.getTransactionId(),
                counterpart.getId(),
                counterpart.getNickname(),
                counterpart.getProfileImage(),
                listing.getTitle(),
                firstImageUrl(listing),
                listing.getStatus(),
                transaction.getStatus(),
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
        Member recipient = resolveCounterpart(room.getTransaction(), sender.getId());
        if (presenceRegistry.isOnline(room.getRoomId(), recipient.getId())) {
            return;
        }

        String listingTitle = room.getTransaction().getListing().getTitle();
        String preview = MESSAGE_TYPE_IMAGE.equals(messageType)
                ? sender.getNickname() + "님이 사진을 보냈어요"
                : sender.getNickname() + "님: " + truncate(messageText, NOTIFICATION_PREVIEW_MAX_LENGTH);

        notificationService.notifyMember(recipient.getId(), null, NOTIFICATION_TYPE_NEW_MESSAGE, listingTitle + " 채팅", preview);
    }

    private String truncate(String text, int maxLength) {
        return text.length() <= maxLength ? text : text.substring(0, maxLength) + "…";
    }

    private Member resolveCounterpart(UsedTransaction transaction, Long requesterId) {
        boolean requesterIsBuyer = transaction.getBuyer().getId().equals(requesterId);
        return requesterIsBuyer ? transaction.getListing().getSeller() : transaction.getBuyer();
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

    private void requireParticipant(UsedTransaction transaction, Long memberId) {
        boolean isBuyer = transaction.getBuyer().getId().equals(memberId);
        boolean isSeller = transaction.getListing().getSeller().getId().equals(memberId);
        if (!isBuyer && !isSeller) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이 거래의 채팅방에 접근할 수 없어요.");
        }
    }

    private TradeChatRoomDto toRoomDto(TradeChatRoom room, Long requesterId) {
        UsedTransaction transaction = room.getTransaction();
        UsedListing listing = transaction.getListing();
        Member counterpart = resolveCounterpart(transaction, requesterId);

        boolean online = presenceRegistry.isOnline(room.getRoomId(), counterpart.getId());
        LocalDateTime lastSeenAt = online
                ? null
                : tradeChatMessageRepository.findLastMessageTimeBySender(room.getRoomId(), counterpart.getId());

        return new TradeChatRoomDto(
                room.getRoomId(),
                transaction.getTransactionId(),
                transaction.getStatus(),
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
