package com.example.festival.tradechat.dto;

import java.time.LocalDateTime;

public record TradeChatMessageDto(
        Long messageId,
        Long roomId,
        Long senderId,
        String senderNickname,
        String senderProfileImage,
        String messageType,
        String message,
        boolean read,
        LocalDateTime createdAt
) {
}
