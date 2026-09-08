package com.example.festival.tradechat.controller;

import com.example.festival.tradechat.dto.SendTradeChatMessageRequest;
import com.example.festival.tradechat.service.TradeChatService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

/**
 * STOMP 실시간 메시지 전송. 클라이언트는 /app/trade-chat-rooms/{roomId}/send 로 SEND하고,
 * 저장 + 구독자 브로드캐스트는 TradeChatService가 /topic/trade-chat-rooms/{roomId} 로 처리한다.
 */
@Controller
@RequiredArgsConstructor
public class TradeChatWebSocketController {

    private final TradeChatService tradeChatService;

    @MessageMapping("/trade-chat-rooms/{roomId}/send")
    public void send(@DestinationVariable Long roomId, @Valid SendTradeChatMessageRequest request) {
        tradeChatService.send(roomId, request.memberId(), request.message(), request.messageType());
    }
}
