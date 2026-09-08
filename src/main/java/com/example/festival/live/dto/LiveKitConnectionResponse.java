package com.example.festival.live.dto;

public record LiveKitConnectionResponse(
        String serverUrl,
        String token,
        String roomName,
        boolean publisher,
        String provider
) {
}
