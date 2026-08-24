package com.example.festival.community.service;

import com.example.festival.community.dto.PostDetailResponse;
import com.example.festival.community.dto.PostLikeResponse;
import com.example.festival.community.dto.PostRequest;
import com.example.festival.community.dto.PostSummaryResponse;
import com.example.festival.community.entity.Post;
import com.example.festival.community.entity.PostLike;
import com.example.festival.community.repository.PostCommentLikeRepository;
import com.example.festival.community.repository.PostCommentRepository;
import com.example.festival.community.repository.PostLikeRepository;
import com.example.festival.community.repository.PostRepository;
import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private static final String POST_IMAGE_SUBDIR = "community";
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of("image/jpeg", "image/png", "image/webp", "image/gif");

    private final PostRepository postRepository;
    private final PostCommentRepository postCommentRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostCommentLikeRepository postCommentLikeRepository;
    private final MemberRepository memberRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public List<PostSummaryResponse> getPosts(String category, String keyword) {
        String normalizedCategory = (category == null || category.isBlank()) ? null : category;
        String normalizedKeyword = (keyword == null || keyword.isBlank()) ? null : keyword;

        List<Post> posts = postRepository.search(normalizedCategory, normalizedKeyword);

        return posts.stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    // 프로필 - 내가 쓴 글
    public List<PostSummaryResponse> getMyPosts(Long memberId) {
        return postRepository.findByMember_IdOrderByCreatedAtDesc(memberId).stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    // 프로필 - 좋아요 누른 글
    public List<PostSummaryResponse> getLikedPosts(Long memberId) {
        return postLikeRepository.findByMember_IdWithPostOrderByCreatedAtDesc(memberId).stream()
                .map(like -> toSummaryResponse(like.getPost()))
                .toList();
    }

    @Transactional
    public PostDetailResponse getPost(Long postId, Long viewerMemberId) {
        Post post = findPost(postId);
        post.increaseViewCount();

        boolean liked = viewerMemberId != null
                && postLikeRepository.existsByPost_PostIdAndMember_Id(postId, viewerMemberId);

        return toDetailResponse(post, liked);
    }

    @Transactional
    public PostDetailResponse createPost(Long memberId, PostRequest request) {
        Member member = findMember(memberId);
        Post post = new Post(member, request.category(), request.title(), request.content(), request.imageUrl());
        postRepository.save(post);
        return toDetailResponse(post, false);
    }

    @Transactional
    public PostDetailResponse updatePost(Long memberId, Long postId, PostRequest request) {
        Post post = findPost(postId);
        requireOwner(post, memberId);
        post.update(request.category(), request.title(), request.content(), request.imageUrl());

        boolean liked = postLikeRepository.existsByPost_PostIdAndMember_Id(postId, memberId);
        return toDetailResponse(post, liked);
    }

    @Transactional
    public void deletePost(Long memberId, Long postId) {
        Post post = findPost(postId);
        requireOwner(post, memberId);

        postLikeRepository.deleteByPost_PostId(postId);
        postCommentLikeRepository.deleteByPostComment_Post_PostId(postId);
        postCommentRepository.deleteAll(postCommentRepository.findByPost_PostIdOrderByCommentIdDesc(postId));
        postRepository.delete(post);
    }

    @Transactional
    public PostLikeResponse likePost(Long memberId, Long postId) {
        Post post = findPost(postId);
        Member member = findMember(memberId);

        if (!postLikeRepository.existsByPost_PostIdAndMember_Id(postId, memberId)) {
            postLikeRepository.save(new PostLike(post, member));
        }

        return new PostLikeResponse(postLikeRepository.countByPost_PostId(postId), true);
    }

    @Transactional
    public PostLikeResponse unlikePost(Long memberId, Long postId) {
        findPost(postId);
        postLikeRepository.deleteByPost_PostIdAndMember_Id(postId, memberId);
        return new PostLikeResponse(postLikeRepository.countByPost_PostId(postId), false);
    }

    public String uploadImage(Long memberId, MultipartFile file) {
        findMember(memberId);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일이 비어 있습니다.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "jpg, png, webp, gif 형식의 이미지만 등록할 수 있습니다.");
        }

        return "/uploads/" + POST_IMAGE_SUBDIR + "/" + storeFile(file, memberId);
    }

    private String storeFile(MultipartFile file, Long memberId) {
        try {
            Path uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
            Path targetDir = uploadRoot.resolve(POST_IMAGE_SUBDIR);
            Files.createDirectories(targetDir);

            String extension = extractExtension(file.getOriginalFilename());
            String fileName = memberId + "_" + UUID.randomUUID() + extension;
            Path targetPath = targetDir.resolve(fileName).normalize();

            file.transferTo(targetPath);
            return fileName;
        } catch (IOException e) {
            throw new UncheckedIOException("게시글 이미지 저장에 실패했습니다.", e);
        }
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        int dotIndex = originalFilename.lastIndexOf('.');
        return dotIndex >= 0 ? originalFilename.substring(dotIndex) : "";
    }

    private PostSummaryResponse toSummaryResponse(Post post) {
        return new PostSummaryResponse(
                post.getPostId(),
                post.getCategory(),
                post.getTitle(),
                post.getContent(),
                post.getImageUrl(),
                post.getMember().getId(),
                post.getMember().getNickname(),
                post.getMember().getProfileImage(),
                post.getViewCount(),
                postLikeRepository.countByPost_PostId(post.getPostId()),
                postCommentRepository.countByPost_PostId(post.getPostId()),
                post.getCreatedAt()
        );
    }

    private PostDetailResponse toDetailResponse(Post post, boolean liked) {
        return new PostDetailResponse(
                post.getPostId(),
                post.getCategory(),
                post.getTitle(),
                post.getContent(),
                post.getImageUrl(),
                post.getMember().getId(),
                post.getMember().getNickname(),
                post.getMember().getProfileImage(),
                post.getViewCount(),
                postLikeRepository.countByPost_PostId(post.getPostId()),
                liked,
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }

    private Post findPost(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));
    }

    private Member findMember(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));
    }

    private void requireOwner(Post post, Long memberId) {
        if (!post.getMember().getId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 게시글만 수정/삭제할 수 있습니다.");
        }
    }
}
