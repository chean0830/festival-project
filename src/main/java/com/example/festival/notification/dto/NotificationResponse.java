package com.example.festival.notification.dto;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long notificationId,
        String type,
        String title,
        String content,
        Long eventId,
        String linkPath,
        boolean read,
        LocalDateTime createdAt
) {
}
