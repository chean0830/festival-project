package com.example.festival.chat.redis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;

/**
 * Redis pub/sub로 들어온 오픈채팅 브로드캐스트를, 이 서버 인스턴스에 붙어있는
 * 클라이언트에게 로컬 STOMP 브로커를 통해 전달한다 (ChatRedisPublisher와 짝).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChatRedisSubscriber implements MessageListener {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String envelopeJson = new String(message.getBody(), StandardCharsets.UTF_8);
            ChatBroadcastEnvelope envelope = OBJECT_MAPPER.readValue(envelopeJson, ChatBroadcastEnvelope.class);
            messagingTemplate.convertAndSend(envelope.destination(), envelope.payloadJson());
        } catch (Exception e) {
            log.warn("Redis에서 받은 채팅 브로드캐스트 처리 실패: {}", e.getMessage());
        }
    }
}
