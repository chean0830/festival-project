package com.example.festival.profile.dto;

import java.time.LocalDate;

public record UpcomingEventResponse(
        Long eventId,
        String name,
        String posterImageUrl,
        LocalDate startDate,
        LocalDate endDate,
        long dDay
) {
}
