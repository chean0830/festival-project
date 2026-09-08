package com.example.festival.live.admission.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record LiveAdmissionResponse(
        Long paymentId,
        Long streamId,
        String streamTitle,
        BigDecimal amount,
        String paymentMethod,
        String status,
        LocalDateTime paidAt
) {
}
