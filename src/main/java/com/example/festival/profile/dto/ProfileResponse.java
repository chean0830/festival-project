package com.example.festival.profile.dto;

public record ProfileResponse(
        Long memberId,
        String nickname,
        String profileImageUrl,
        String introduction
) {
}
