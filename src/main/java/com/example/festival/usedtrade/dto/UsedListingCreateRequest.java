package com.example.festival.usedtrade.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record UsedListingCreateRequest(
        @NotBlank String title,
        String description,
        @NotNull BigDecimal price,
        String condition,
        String tradeMethod,
        String region,
        @NotNull @Size(min = 2, message = "사진을 최소 2장 등록해주세요.") List<String> imageUrls,
        @NotBlank String category,
        String tags
) {
}
