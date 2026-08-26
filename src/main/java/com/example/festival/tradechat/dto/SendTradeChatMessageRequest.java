package com.example.festival.tradechat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SendTradeChatMessageRequest(
        @NotNull Long memberId,
        @NotBlank @Size(max = 1000) String message,
        String messageType
) {
}
