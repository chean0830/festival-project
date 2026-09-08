package com.example.festival.live.dto;

import com.example.festival.event.entity.Event;
import java.time.LocalDate;

public record LiveEventOptionResponse(
        Long eventId,
        String name,
        String posterImage,
        LocalDate startDate,
        LocalDate endDate
) {
    public static LiveEventOptionResponse from(Event event) {
        return new LiveEventOptionResponse(
                event.getEventId(),
                event.getName(),
                event.getPosterImage(),
                event.getStartDate(),
                event.getEndDate()
        );
    }
}
