package com.example.festival.chat.dto;

import java.time.LocalDateTime;

public record ChatMessageDto(
        Long messageId,
        Long roomId,
        Long memberId,
        String nickname,
        String profileImage,
        String message,
        LocalDateTime createdAt
) {
}
