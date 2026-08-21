package com.example.festival.community.dto;

import java.time.LocalDateTime;

/**
 * 커뮤니티 목록용 응답 DTO.
 */
public record PostSummaryResponse(
        Long id,
        String category,
        String title,
        String content,
        String imageUrl,
        Long authorId,
        String authorNickname,
        String authorProfileImage,
        int viewCount,
        long likeCount,
        long commentCount,
        LocalDateTime createdAt
) {
}
