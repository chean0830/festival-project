package com.example.festival.festivalrecord.dto;

import java.time.LocalDateTime;

public record FestivalRecordSummaryResponse(
        Long recordId,
        Long eventId,
        String eventName,
        String thumbnailImageUrl,
        String title,
        Integer rating,
        String oneLineReview,
        LocalDateTime createdAt
) {
}
