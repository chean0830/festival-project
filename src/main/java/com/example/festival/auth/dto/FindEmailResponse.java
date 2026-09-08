package com.example.festival.auth.dto;

public record FindEmailResponse(boolean found, String maskedEmail, String message) {
}
