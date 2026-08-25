package com.example.festival.festivalrecord.dto;

import java.time.LocalDateTime;

public record PosterVersionResponse(
        Long versionId,
        String imageUrl,
        String styleRequest,
        LocalDateTime createdAt
) {
}
