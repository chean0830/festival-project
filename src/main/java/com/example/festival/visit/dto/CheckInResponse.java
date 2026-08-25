package com.example.festival.visit.dto;

public record CheckInResponse(
        boolean success,
        String message,
        Integer distanceMeters
) {
}
