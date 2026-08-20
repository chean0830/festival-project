package com.example.demo.profile.dto;

import java.time.LocalDate;

public record AttendedEventResponse(
        Long eventId,
        String name,
        String posterImageUrl,
        LocalDate startDate,
        LocalDate endDate,
        int year
) {
}
