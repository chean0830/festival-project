package com.example.festival.chat.controller;

import com.example.festival.chat.dto.ChatMessageDto;
import com.example.festival.chat.dto.ChatRoomDto;
import com.example.festival.chat.dto.OpenChatRoomListItemDto;
import com.example.festival.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 페스티벌별 오픈채팅방 REST API (조회 + 나가기/차단).
 * 실시간 메시지 전송은 STOMP(/ws-chat)로 처리한다 (ChatWebSocketController).
 */
@RestController
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatService chatService;

    @GetMapping("/api/chat-rooms/by-event/{eventId}")
    public ChatRoomDto getRoomByEvent(@PathVariable Long eventId, @RequestParam(required = false) Long memberId) {
        return chatService.getOrCreateRoomForEvent(eventId, memberId);
    }

    @GetMapping("/api/members/{memberId}/chat-rooms")
    public List<OpenChatRoomListItemDto> listMyRooms(@PathVariable Long memberId) {
        return chatService.listMyRooms(memberId);
    }

    @GetMapping("/api/chat-rooms/{roomId}/messages")
    public List<ChatMessageDto> getMessages(@PathVariable Long roomId) {
        return chatService.getHistory(roomId);
    }

    @GetMapping("/api/chat-rooms/{roomId}/messages/latest")
    public ChatMessageDto getLatestMessage(@PathVariable Long roomId) {
        return chatService.getLatestMessage(roomId);
    }

    @PostMapping("/api/members/{memberId}/chat-rooms/{roomId}/join")
    public ChatRoomDto join(@PathVariable Long memberId, @PathVariable Long roomId) {
        return chatService.join(memberId, roomId);
    }

    @PostMapping("/api/members/{memberId}/chat-rooms/{roomId}/leave")
    public void leave(@PathVariable Long memberId, @PathVariable Long roomId) {
        chatService.leave(memberId, roomId);
    }

    @PostMapping("/api/members/{memberId}/chat-rooms/{roomId}/block/{targetMemberId}")
    public void block(@PathVariable Long memberId, @PathVariable Long roomId, @PathVariable Long targetMemberId) {
        chatService.block(memberId, roomId, targetMemberId);
    }
}
