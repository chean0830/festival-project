package com.example.festival.youtube.dto;

public record YouTubeBroadcastSetupResponse(
        String broadcastId,
        String youtubeUrl,
        String obsServerUrl,
        String streamKey
) {
}
