package com.example.festival.chat.redis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

/**
 * 오픈채팅 실시간 브로드캐스트를 Redis pub/sub로 내보낸다.
 * 서버가 여러 대일 때, 각 인스턴스가 이 채널을 구독(ChatRedisSubscriber)해서
 * 자기한테 붙어있는 클라이언트에게만 로컬로 전달하는 방식으로 인스턴스 간 동기화를 맞춘다.
 *
 * 로컬 개발처럼 Redis가 아예 없는 환경에서도 채팅이 끊기면 안 되므로,
 * publish가 실패하면(연결 불가 등) 그 자리에서 바로 로컬 브로커로 직접 전송한다 — 지금 단일 서버
 * 구성에서는 이 fallback 경로가 곧 기존 동작과 동일하다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChatRedisPublisher {

    public static final String CHANNEL = "festlog:chat:broadcast";

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final StringRedisTemplate redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    public void publish(String destination, Object payload) {
        try {
            String payloadJson = OBJECT_MAPPER.writeValueAsString(payload);
            String envelopeJson = OBJECT_MAPPER.writeValueAsString(new ChatBroadcastEnvelope(destination, payloadJson));
            redisTemplate.convertAndSend(CHANNEL, envelopeJson);
        } catch (Exception e) {
            log.debug("Redis publish 실패 — 로컬 브로커로 직접 전송합니다 (Redis 미연결 등): {}", e.getMessage());
            messagingTemplate.convertAndSend(destination, payload);
        }
    }
}
