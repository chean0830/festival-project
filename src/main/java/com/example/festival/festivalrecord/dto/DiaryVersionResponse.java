package com.example.festival.festivalrecord.dto;

import java.time.LocalDateTime;

public record DiaryVersionResponse(
        Long versionId,
        String content,
        String summary,
        LocalDateTime createdAt
) {
}
