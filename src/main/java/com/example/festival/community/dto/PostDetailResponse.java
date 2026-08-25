package com.example.festival.community.dto;

import java.time.LocalDateTime;

/**
 * 게시글 상세용 응답 DTO.
 * liked: 요청한 memberId 기준으로 좋아요 눌렀는지 여부 (memberId 없이 조회하면 항상 false)
 */
public record PostDetailResponse(
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
        boolean liked,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
