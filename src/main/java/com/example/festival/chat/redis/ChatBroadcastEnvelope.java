package com.example.festival.chat.redis;

/**
 * Redis pub/sub로 서버 인스턴스 간에 주고받는 봉투.
 * destination: STOMP 브로드캐스트 목적지 (예: /topic/chat-rooms/5)
 * payloadJson: 실제로 클라이언트에 보낼 메시지(ChatMessageDto/PresenceEvent 등)를 미리 JSON 문자열로 직렬화한 것.
 *   받는 쪽에서 다시 역직렬화하지 않고 그대로 STOMP 바디로 전달한다.
 */
public record ChatBroadcastEnvelope(String destination, String payloadJson) {
}
