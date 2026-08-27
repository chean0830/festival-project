package com.example.festival.chat.dto;

import java.time.LocalDateTime;

public record OpenChatRoomListItemDto(
        Long roomId,
        Long eventId,
        String eventName,
        String lastMessage,
        LocalDateTime lastMessageAt,
        long participantCount
) {
}
