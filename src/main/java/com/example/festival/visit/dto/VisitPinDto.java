package com.example.festival.visit.dto;

import java.time.LocalDate;

public record VisitPinDto(
        Long eventId,
        String eventName,
        String venueName,
        Double latitude,
        Double longitude,
        LocalDate startDate,
        LocalDate endDate
) {
}
