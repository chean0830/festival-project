package com.example.festival.tradechat.dto;

public record TradeChatPresenceEvent(Long roomId, Long memberId, boolean online) {
}
