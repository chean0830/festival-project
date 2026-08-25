package com.example.festival.payment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

/**
 * Toss Payments 결제 승인 API 응답 중 우리가 실제로 쓰는 필드만 매핑한다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record TossConfirmResponse(
        String paymentKey,
        String orderId,
        String status,
        String method,
        BigDecimal totalAmount
) {
}
