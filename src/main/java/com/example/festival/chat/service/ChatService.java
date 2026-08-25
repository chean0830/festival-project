package com.example.festival.chat.service;

import com.example.festival.chat.dto.ChatMessageDto;
import com.example.festival.chat.dto.ChatRoomDto;
import com.example.festival.chat.dto.PresenceEvent;
import com.example.festival.chat.entity.OpenChatMember;
import com.example.festival.chat.entity.OpenChatMessage;
import com.example.festival.chat.entity.OpenChatRoom;
import com.example.festival.chat.redis.ChatRedisPublisher;
import com.example.festival.chat.repository.OpenChatMemberRepository;
import com.example.festival.chat.repository.OpenChatMessageRepository;
import com.example.festival.chat.repository.OpenChatRoomRepository;
import com.example.festival.event.entity.Event;
import com.example.festival.event.repository.EventRepository;
import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

/**
 * 오픈채팅방 조회/입장/퇴장 + 메시지 조회/전송(실시간 브로드캐스트) + 채팅 관리(금칙어/신고 연동/차단).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private static final int HISTORY_SIZE = 50;

    private final OpenChatRoomRepository chatRoomRepository;
    private final OpenChatMessageRepository chatMessageRepository;
    private final OpenChatMemberRepository chatMemberRepository;
    private final EventRepository eventRepository;
    private final MemberRepository memberRepository;
    private final ProfanityFilter profanityFilter;
    private final ChatRedisPublisher chatRedisPublisher;

    @Transactional
    public ChatRoomDto getOrCreateRoomForEvent(Long eventId, Long memberId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공연을 찾을 수 없습니다."));

        OpenChatRoom room = chatRoomRepository.findByEvent_EventId(eventId)
                .orElseGet(() -> chatRoomRepository.save(new OpenChatRoom(event, event.getName() + " 오픈채팅")));

        boolean blocked = memberId != null
                && chatMemberRepository.findByRoom_RoomIdAndMember_Id(room.getRoomId(), memberId)
                        .map(OpenChatMember::isBlocked)
                        .orElse(false);

        long participantCount = chatMemberRepository.countByRoom_RoomIdAndLeftAtIsNull(room.getRoomId());

        return new ChatRoomDto(room.getRoomId(), event.getEventId(), event.getName(), room.getName(), blocked, participantCount);
    }

    /**
     * 채팅방 입장. 참여자로 등록(또는 재입장 처리)하고, 참여자 수 변동을 방 안 사람들에게 실시간으로 알린다.
     */
    @Transactional
    public ChatRoomDto join(Long memberId, Long roomId) {
        OpenChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방을 찾을 수 없습니다."));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));

        OpenChatMember chatMember = chatMemberRepository.findByRoom_RoomIdAndMember_Id(roomId, memberId)
                .orElse(null);

        if (chatMember != null && chatMember.isBlocked()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "이 채팅방에서 차단되어 입장할 수 없어요.");
        }

        boolean activated = activateMember(chatMember, room, member);
        if (activated) {
            broadcastPresence(roomId, "JOIN", member.getNickname());
        }

        Event event = room.getEvent();
        long participantCount = chatMemberRepository.countByRoom_RoomIdAndLeftAtIsNull(roomId);
        return new ChatRoomDto(room.getRoomId(), event.getEventId(), event.getName(), room.getName(), false, participantCount);
    }

    public List<ChatMessageDto> getHistory(Long roomId) {
        return chatMessageRepository.findRecentByRoomId(roomId, PageRequest.of(0, HISTORY_SIZE)).stream()
                .sorted(Comparator.comparing(OpenChatMessage::getCreatedAt).thenComparing(OpenChatMessage::getMessageId))
                .map(this::toDto)
                .toList();
    }

    /**
     * 상세페이지의 "새 메시지 있음" 배지 표시용 — 전체 히스토리를 안 불러오고 최신 1건만 확인한다.
     */
    public ChatMessageDto getLatestMessage(Long roomId) {
        return chatMessageRepository.findRecentByRoomId(roomId, PageRequest.of(0, 1)).stream()
                .findFirst()
                .map(this::toDto)
                .orElse(null);
    }

    /**
     * 메시지 전송. 차단된 회원이 보낸 메시지는 조용히 무시한다 (STOMP는 별도 에러 응답 채널이 없어서,
     * 차단 여부는 방 조회 시점에 프론트에서 먼저 안내하고 여기서는 방어적으로 한 번 더 막는다).
     */
    @Transactional
    public void send(Long roomId, Long memberId, String rawMessage) {
        String trimmed = rawMessage.trim();
        if (trimmed.isEmpty()) {
            return;
        }

        OpenChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방을 찾을 수 없습니다."));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));

        OpenChatMember chatMember = chatMemberRepository.findByRoom_RoomIdAndMember_Id(roomId, memberId)
                .orElse(null);

        if (chatMember != null && chatMember.isBlocked()) {
            return;
        }
        boolean activated = activateMember(chatMember, room, member);
        if (activated) {
            broadcastPresence(roomId, "JOIN", member.getNickname());
        }

        String filtered = profanityFilter.filter(trimmed);
        OpenChatMessage message = new OpenChatMessage(room, member, filtered);
        chatMessageRepository.save(message);

        chatRedisPublisher.publish("/topic/chat-rooms/" + roomId, toDto(message));
    }

    @Transactional
    public void leave(Long memberId, Long roomId) {
        OpenChatMember chatMember = chatMemberRepository.findByRoom_RoomIdAndMember_Id(roomId, memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "참여 중인 채팅방이 아니에요."));

        if (chatMember.isActive()) {
            chatMember.leave();
            broadcastPresence(roomId, "LEAVE", chatMember.getMember().getNickname());
        }
    }

    @Transactional
    public void block(Long actingMemberId, Long roomId, Long targetMemberId) {
        if (actingMemberId.equals(targetMemberId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "자기 자신은 차단할 수 없어요.");
        }

        OpenChatMember target = chatMemberRepository.findByRoom_RoomIdAndMember_Id(roomId, targetMemberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅방 참여자를 찾을 수 없어요."));

        target.block();
        broadcastPresence(roomId);
    }

    /**
     * 참여자 행이 없으면 새로 만들고, 있으면 나갔던 상태일 때만 재입장 처리한다.
     * (신규 생성/재입장 둘 다 저장이 필요해 save를 호출한다.)
     *
     * @return 이번 호출로 실제로 "활성화"(신규 입장 또는 재입장) 상태 전환이 있었으면 true.
     *         이미 활성 상태였다면 false — 이 경우 참여자 수가 안 바뀌므로 알릴 필요가 없다.
     */
    private boolean activateMember(OpenChatMember chatMember, OpenChatRoom room, Member member) {
        if (chatMember == null) {
            chatMemberRepository.save(new OpenChatMember(room, member));
            return true;
        }
        if (!chatMember.isActive()) {
            chatMember.rejoin();
            return true;
        }
        return false;
    }

    private void broadcastPresence(Long roomId) {
        broadcastPresence(roomId, null, null);
    }

    private void broadcastPresence(Long roomId, String type, String nickname) {
        long participantCount = chatMemberRepository.countByRoom_RoomIdAndLeftAtIsNull(roomId);
        chatRedisPublisher.publish("/topic/chat-rooms/" + roomId + "/presence",
                new PresenceEvent(roomId, participantCount, type, nickname));
    }

    private ChatMessageDto toDto(OpenChatMessage message) {
        Member member = message.getMember();
        return new ChatMessageDto(
                message.getMessageId(),
                message.getRoom().getRoomId(),
                member.getId(),
                member.getNickname(),
                member.getProfileImage(),
                message.getMessage(),
                message.getCreatedAt()
        );
    }
}
