package com.example.festival.tradechat.dto;

public record TradeChatReadEvent(Long roomId, Long readerId, Long upToMessageId) {
}
