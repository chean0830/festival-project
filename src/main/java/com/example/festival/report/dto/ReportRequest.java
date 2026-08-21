package com.example.festival.report.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReportRequest(
        @NotBlank(message = "신고 대상 종류를 입력해주세요.")
        String targetType,

        @NotNull(message = "신고 대상을 선택해주세요.")
        Long targetId,

        @Size(max = 500)
        String reason
) {
}
