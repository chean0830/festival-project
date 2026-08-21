package com.example.festival.search.dto;

/**
 * 통합 검색(아티스트/페스티벌/공연) 결과 하나를 나타내는 DTO.
 */
public record SearchResultDto(
        String id,
        String type,
        String name,
        String subtitle,
        String image
) {
}
