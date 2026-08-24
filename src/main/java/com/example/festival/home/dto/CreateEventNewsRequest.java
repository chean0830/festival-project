package com.example.festival.home.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateEventNewsRequest(
        @NotBlank(message = "제목을 입력해주세요.")
        String title,

        String content,

        @NotBlank(message = "소식 종류를 입력해주세요.")
        String newsType,

        String imageUrl,

        String sourceUrl
) {
}
