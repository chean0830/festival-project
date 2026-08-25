package com.example.festival.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * Toss Payments 결제창(successUrl)에서 돌아온 뒤, 프론트가 서버에 결제 승인을 요청할 때 보내는 값.
 * orderId는 Toss에 넘긴 문자열 주문번호(우리 쪽 orderId/transactionId와는 다름)다.
 */
public record PaymentConfirmRequest(
        @NotBlank String paymentKey,
        @NotBlank String orderId,
        @NotNull @Positive BigDecimal amount
) {
}
