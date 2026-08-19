package com.example.demo.profile.dto;

public record ProfileResponse(
        Long memberId,
        String nickname,
        String profileImageUrl,
        String introduction
) {
}
