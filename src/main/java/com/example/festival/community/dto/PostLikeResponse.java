package com.example.festival.community.dto;

public record PostLikeResponse(
        long likeCount,
        boolean liked
) {
}
