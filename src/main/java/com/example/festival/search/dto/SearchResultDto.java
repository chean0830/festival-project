package com.example.festival.search.dto;

import java.time.LocalDate;

/**
 * 통합 검색(아티스트/페스티벌/공연) 결과 하나를 나타내는 DTO.
 * endDate는 festival/event 타입에서만 채워지고(아티스트는 null), "이미 끝난 공연" 판별용으로 쓴다.
 */
public record SearchResultDto(
        String id,
        String type,
        String name,
        String subtitle,
        String image,
        LocalDate endDate
) {
}
