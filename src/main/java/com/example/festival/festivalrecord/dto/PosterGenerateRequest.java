package com.example.festival.festivalrecord.dto;

import jakarta.validation.constraints.Size;

public record PosterGenerateRequest(
        @Size(max = 200, message = "포스터 느낌 요청은 200자 이내로 입력해주세요.")
        String styleRequest
) {
}
