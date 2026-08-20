package com.example.festival.profile.dto;

public record ProfileStatsResponse(
        long totalVisits,
        long thisYearVisits,
        String favoriteGenre
) {
}
