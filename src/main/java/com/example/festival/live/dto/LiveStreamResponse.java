package com.example.festival.live.dto;

import com.example.festival.live.entity.LiveStreamStatus;
import java.time.LocalDateTime;

public record LiveStreamResponse(
        Long streamId,
        Long eventId,
        String eventName,
        String title,
        String description,
        String thumbnailUrl,
        String youtubeVideoId,
        String youtubeWatchUrl,
        String youtubeEmbedUrl,
        LiveStreamStatus status,
        LocalDateTime startAt,
        LocalDateTime endAt,
        Long hostMemberId,
        String hostNickname,
        String hostProfileImage,
        boolean owner,
        LocalDateTime createdAt
) {
}
