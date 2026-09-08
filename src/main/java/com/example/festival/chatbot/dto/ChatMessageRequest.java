package com.example.festival.chatbot.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatMessageRequest(
        @NotBlank(message = "메시지를 입력해 주세요.")
        String message
) {
}
