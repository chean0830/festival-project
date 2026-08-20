package com.example.demo.profile.dto;

import jakarta.validation.constraints.Size;

public record IntroductionUpdateRequest(
        @Size(max = 100, message = "자기소개는 100자 이내로 작성해주세요.")
        String introduction
) {
}
