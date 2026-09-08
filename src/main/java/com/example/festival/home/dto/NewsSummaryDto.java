package com.example.festival.home.dto;

import java.time.LocalDateTime;

/**
 * 홈 화면 뉴스 섹션용 응답 DTO.
 */
public record NewsSummaryDto(
        Long id,
        String title,
        String imageUrl,
        String sourceUrl,
        String newsType,
        LocalDateTime createdAt,
        Long eventId,
        String eventName
) {
}
