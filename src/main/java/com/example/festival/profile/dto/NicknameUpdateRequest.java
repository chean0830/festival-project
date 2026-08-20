package com.example.festival.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record NicknameUpdateRequest(
        @NotBlank(message = "닉네임을 입력해주세요.")
        @Pattern(
                regexp = "^[가-힣a-zA-Z0-9]{2,10}$",
                message = "닉네임은 2~10자의 한글, 영문, 숫자만 사용할 수 있습니다."
        )
        String nickname
) {
}
