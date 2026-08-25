package com.example.festival.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostCommentRequest(
        @NotBlank(message = "댓글 내용을 입력해주세요.")
        @Size(max = 1000)
        String content,

        // null이면 최상위 댓글, 있으면 그 댓글에 대한 대댓글
        Long parentId
) {
}
