package com.example.demo.profile.dto;

import java.time.LocalDateTime;

public record BadgeResponse(
        Long badgeId,
        String name,
        String description,
        String badgeImage,
        boolean earned,
        boolean newlyEarned,
        LocalDateTime acquiredAt
) {
}
