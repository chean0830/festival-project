package com.example.festival.tradechat.dto;

public record TradeChatWarningEvent(Long roomId, Long messageId, String warningText) {
}
