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
        String aiDiary,
        String aiSummary,
        int aiDiaryUsedCount,
        int aiDiaryFreeLimit,
        Integer rating,
        String oneLineReview,
        String memo,
        String hashtag,
        String mood,
        String posterImageUrl,
        boolean shared,
        int aiRegeneratedCount,
        int aiPosterFreeLimit,
        List<RecordImageResponse> images,
        List<RecordSongResponse> songs,
        List<String> foods,
        List<PosterVersionResponse> posterVersions,
        List<DiaryVersionResponse> diaryVersions,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
