package com.example.festival.chat.dto;

public record ChatRoomDto(
        Long roomId,
        Long eventId,
        String eventName,
        String roomName,
        boolean blocked,
        long participantCount
) {
}
