package com.example.demo.profile.dto;

public record ProfileStatsResponse(
        long totalVisits,
        long thisYearVisits,
        String favoriteGenre
) {
}
