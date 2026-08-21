package com.example.festival.community.dto;

import java.time.LocalDateTime;

/**
 * 프로필 - 내가 쓴 댓글 목록용 응답 DTO.
 */
public record MyCommentResponse(
        Long id,
        Long postId,
        String postTitle,
        String content,
        LocalDateTime createdAt
) {
}
