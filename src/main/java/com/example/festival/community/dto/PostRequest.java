package com.example.festival.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostRequest(
        @NotBlank(message = "카테고리를 선택해주세요.")
        String category,

        @NotBlank(message = "제목을 입력해주세요.")
        @Size(max = 200)
        String title,

        String content,

        String imageUrl
) {
}
