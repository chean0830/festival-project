package com.example.festival.youtube.dto;

public record YouTubeConnectionStatusResponse(
        boolean configured,
        boolean connected,
        boolean liveEnabled,
        String channelTitle,
        String message
) {
}
