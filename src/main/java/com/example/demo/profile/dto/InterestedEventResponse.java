package com.example.demo.profile.dto;

import java.time.LocalDate;

public record InterestedEventResponse(
        Long eventId,
        String name,
        String posterImageUrl,
        LocalDate startDate,
        LocalDate endDate,
        String eventStatus,
        String interestStatus
) {
}
