package com.example.festival.chat.controller;

import com.example.festival.chat.dto.SendMessageRequest;
import com.example.festival.chat.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

/**
 * STOMP 실시간 메시지 전송.
 * 클라이언트는 /app/chat-rooms/{roomId}/send 로 SEND하고,
 * 저장 + 구독자 브로드캐스트는 ChatService가 /topic/chat-rooms/{roomId} 로 처리한다.
 */
@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;

    @MessageMapping("/chat-rooms/{roomId}/send")
    public void send(@DestinationVariable Long roomId, @Valid SendMessageRequest request) {
        chatService.send(roomId, request.memberId(), request.message());
    }
}
