package com.example.festival.festivalrecord.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ReorderImagesRequest(
        @NotEmpty(message = "사진 순서를 입력해주세요.")
        List<Long> imageIds
) {
}
