package com.example.festival.live.donation.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DonationResponse(
        Long donationId,
        Long streamId,
        String streamTitle,
        String donorNickname,
        BigDecimal amount,
        String message,
        String status,
        LocalDateTime createdAt
) {
}
