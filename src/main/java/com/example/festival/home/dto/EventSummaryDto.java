package com.example.festival.home.dto;

import java.time.LocalDate;

/**
 * 홈 화면 공연일정 캐러셀용 응답 DTO.
 * 프론트 ProgramCarousel이 기대하는 모양(id, name, time)에 맞춰서 가공해서 내려줌.
 */
public record EventSummaryDto(
        Long id,
        String name,
        String venueName,
        LocalDate startDate,
        LocalDate endDate,
        String posterImage,
        String region,
        String kind
) {
}
