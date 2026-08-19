package com.example.demo.auth.dto;

public record FindEmailResponse(boolean found, String maskedEmail, String message) {
}
