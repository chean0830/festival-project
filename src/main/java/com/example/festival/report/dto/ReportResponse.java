package com.example.festival.report.dto;

import java.time.LocalDateTime;

public record ReportResponse(
        Long id,
        String targetType,
        Long targetId,
        String status,
        LocalDateTime createdAt
) {
}
