package com.example.festival.community.controller;

import com.example.festival.community.dto.MyCommentResponse;
import com.example.festival.community.dto.PostCommentRequest;
import com.example.festival.community.dto.PostCommentResponse;
import com.example.festival.community.service.PostCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 커뮤니티 댓글/대댓글 API.
 * 목록 조회는 로그인 없이 볼 수 있고, 작성/삭제는 로그인 필요.
 */
@RestController
@RequiredArgsConstructor
public class PostCommentController {

    private final PostCommentService postCommentService;

    @GetMapping("/api/posts/{postId}/comments")
    public List<PostCommentResponse> getComments(@PathVariable Long postId) {
        return postCommentService.getComments(postId);
    }

    @GetMapping("/api/members/{memberId}/comments")
    public List<MyCommentResponse> getMyComments(@PathVariable Long memberId) {
        return postCommentService.getMyComments(memberId);
    }

    @PostMapping("/api/members/{memberId}/posts/{postId}/comments")
    public PostCommentResponse createComment(
            @PathVariable Long memberId,
            @PathVariable Long postId,
            @Valid @RequestBody PostCommentRequest request
    ) {
        return postCommentService.createComment(memberId, postId, request);
    }

    @DeleteMapping("/api/members/{memberId}/posts/{postId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long memberId,
            @PathVariable Long postId,
            @PathVariable Long commentId
    ) {
        postCommentService.deleteComment(memberId, postId, commentId);
        return ResponseEntity.noContent().build();
    }
}
