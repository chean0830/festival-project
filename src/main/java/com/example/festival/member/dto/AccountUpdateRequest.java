package com.example.festival.member.dto;

import jakarta.validation.constraints.NotBlank;

public record AccountUpdateRequest(
        @NotBlank(message = "휴대전화번호를 입력해 주세요.") String phoneNumber,
        String postalCode,
        @NotBlank(message = "주소를 입력해 주세요.") String roadAddress,
        String detailAddress
) {
}
