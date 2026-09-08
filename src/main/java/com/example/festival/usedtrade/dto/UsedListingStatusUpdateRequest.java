package com.example.festival.usedtrade.dto;

import jakarta.validation.constraints.NotBlank;

public record UsedListingStatusUpdateRequest(
        @NotBlank String status
) {
}
