package com.example.festival.home.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 공연 상세페이지용 응답 DTO.
 */
public record EventDetailDto(
        Long id,
        String name,
        String eventType,
        String description,
        String posterImage,
        LocalDate startDate,
        LocalDate endDate,
        LocalDateTime ticketOpenAt,
        String ticketUrl,
        String status,
        String venueName,
        String venueAddress
) {
}
