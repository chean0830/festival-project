package com.example.festival.home.dto;

import java.time.LocalDateTime;

/**
 * 공연 상세페이지 - 라인업(출연진) 한 명 응답 DTO.
 */
public record LineupArtistDto(
        Long artistId,
        String name,
        String artistType,
        String profileImage,
        String stageName,
        LocalDateTime performanceStart,
        Integer lineupOrder
) {
}
