package com.example.festival.festivalrecord.dto;

import java.time.LocalDateTime;
import java.util.List;

public record FestivalRecordResponse(
        Long recordId,
        Long eventId,
        String eventName,
        String eventPosterImage,
        String title,
        String content,
        Integer rating,
        String oneLineReview,
        String memo,
        String hashtag,
        boolean shared,
        List<RecordImageResponse> images,
        List<RecordSongResponse> songs,
        List<String> foods,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
