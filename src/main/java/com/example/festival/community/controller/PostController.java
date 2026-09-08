package com.example.festival.community.controller;

import com.example.festival.community.dto.PostDetailResponse;
import com.example.festival.community.dto.PostImageUploadResponse;
import com.example.festival.community.dto.PostLikeResponse;
import com.example.festival.community.dto.PostRequest;
import com.example.festival.community.dto.PostSummaryResponse;
import com.example.festival.community.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 커뮤니티 게시글 API.
 * 목록/상세 조회(/api/posts)는 로그인 없이 볼 수 있고,
 * 작성/수정/삭제/좋아요(/api/members/{memberId}/posts)는 로그인 필요.
 * (memberId를 경로로 직접 받는 방식은 ProfileController/FestivalRecordController와 동일한 컨벤션)
 */
@RestController
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping("/api/posts")
    public List<PostSummaryResponse> getPosts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword
    ) {
        return postService.getPosts(category, keyword);
    }

    @GetMapping("/api/posts/{postId}")
    public PostDetailResponse getPost(
            @PathVariable Long postId,
            @RequestParam(required = false) Long memberId
    ) {
        return postService.getPost(postId, memberId);
    }

    @GetMapping("/api/members/{memberId}/posts")
    public List<PostSummaryResponse> getMyPosts(@PathVariable Long memberId) {
        return postService.getMyPosts(memberId);
    }

    @GetMapping("/api/members/{memberId}/posts/liked")
    public List<PostSummaryResponse> getLikedPosts(@PathVariable Long memberId) {
        return postService.getLikedPosts(memberId);
    }

    @PostMapping("/api/members/{memberId}/posts")
    public PostDetailResponse createPost(@PathVariable Long memberId, @Valid @RequestBody PostRequest request) {
        return postService.createPost(memberId, request);
    }

    @PostMapping("/api/members/{memberId}/posts/image")
    public PostImageUploadResponse uploadImage(@PathVariable Long memberId, @RequestParam("file") MultipartFile file) {
        return new PostImageUploadResponse(postService.uploadImage(memberId, file));
    }

    @PatchMapping("/api/members/{memberId}/posts/{postId}")
    public PostDetailResponse updatePost(
            @PathVariable Long memberId,
            @PathVariable Long postId,
            @Valid @RequestBody PostRequest request
    ) {
        return postService.updatePost(memberId, postId, request);
    }

    @DeleteMapping("/api/members/{memberId}/posts/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long memberId, @PathVariable Long postId) {
        postService.deletePost(memberId, postId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/members/{memberId}/posts/{postId}/like")
    public PostLikeResponse likePost(@PathVariable Long memberId, @PathVariable Long postId) {
        return postService.likePost(memberId, postId);
    }

    @DeleteMapping("/api/members/{memberId}/posts/{postId}/like")
    public PostLikeResponse unlikePost(@PathVariable Long memberId, @PathVariable Long postId) {
        return postService.unlikePost(memberId, postId);
    }
}
