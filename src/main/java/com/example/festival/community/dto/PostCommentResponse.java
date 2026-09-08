package com.example.festival.community.dto;

import java.time.LocalDateTime;

public record PostCommentResponse(
        Long id,
        Long parentId,
        Long authorId,
        String authorNickname,
        String authorProfileImage,
        String content,
        LocalDateTime createdAt,
        long likeCount,
        boolean liked
) {
}
