package com.example.demo.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignupRequest(
        @NotBlank(message = "이메일을 입력해 주세요.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        String email,

        @NotBlank(message = "휴대폰 번호를 입력해 주세요.")
        @Pattern(regexp = "^01[016789]-?\\d{3,4}-?\\d{4}$", message = "올바른 휴대폰 번호 형식이 아닙니다.")
        String phoneNumber,

        @NotBlank(message = "우편번호를 검색해 주세요.")
        @Size(max = 10, message = "우편번호가 너무 깁니다.")
        String postalCode,

        @NotBlank(message = "주소를 검색해 주세요.")
        @Size(max = 255, message = "주소가 너무 깁니다.")
        String roadAddress,

        @NotBlank(message = "상세 주소를 입력해 주세요.")
        @Size(max = 255, message = "상세 주소가 너무 깁니다.")
        String detailAddress,

        @NotBlank(message = "닉네임을 입력해 주세요.")
        @Size(min = 2, max = 20, message = "닉네임은 2~20자로 입력해 주세요.")
        String nickname,

        @NotBlank(message = "비밀번호를 입력해 주세요.")
        @Size(min = 8, max = 100, message = "비밀번호는 8자 이상이어야 합니다.")
        String password
) {
}
