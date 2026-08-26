package com.example.festival.live.donation.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record DonationCreateRequest(
        @NotNull
        @DecimalMin(value = "1000", message = "후원 금액은 1,000원 이상이어야 합니다.")
        @DecimalMax(value = "1000000", message = "후원 금액은 1,000,000원 이하여야 합니다.")
        @Digits(integer = 10, fraction = 0, message = "후원 금액은 원 단위로 입력해 주세요.")
        BigDecimal amount,

        @Size(max = 200, message = "응원 메시지는 200자 이하로 입력해 주세요.")
        String message
) {
}
