package com.example.festival.chat.dto;

/**
 * 참여자 수 변동을 실시간으로 알리기 위한 WebSocket 브로드캐스트 페이로드.
 * type/nickname은 "OO님이 입장/퇴장하셨습니다" 시스템 메시지 표시용 — 실제 상태 변화(신규 입장/퇴장)가
 * 있을 때만 채워지고, 단순 참여자 수 갱신(예: 차단)일 때는 null이다.
 */
public record PresenceEvent(
        Long roomId,
        long participantCount,
        String type,
        String nickname
) {
}
