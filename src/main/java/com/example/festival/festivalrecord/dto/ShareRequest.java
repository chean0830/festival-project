package com.example.festival.festivalrecord.dto;

import jakarta.validation.constraints.NotBlank;

public record ShareRequest(
        @NotBlank(message = "공유할 플랫폼을 선택해주세요.")
        String platform,

        String shareUrl
) {
}
