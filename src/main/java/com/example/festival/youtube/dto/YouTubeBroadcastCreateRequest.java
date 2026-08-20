package com.example.festival.youtube.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record YouTubeBroadcastCreateRequest(
        @NotBlank(message = "방송 제목을 입력해 주세요.")
        @Size(max = 100, message = "YouTube 방송 제목은 100자 이하로 입력해 주세요.")
        String title,

        @Size(max = 5000, message = "YouTube 방송 설명은 5000자 이하로 입력해 주세요.")
        String description
) {
}
