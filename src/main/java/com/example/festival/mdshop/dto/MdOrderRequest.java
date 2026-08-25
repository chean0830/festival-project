package com.example.festival.mdshop.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MdOrderRequest(
        @NotNull Long productId,
        @Min(1) @Max(4) int quantity,
        @NotBlank String recipientName,
        @NotBlank String address,
        @NotBlank String phone
) {
}
