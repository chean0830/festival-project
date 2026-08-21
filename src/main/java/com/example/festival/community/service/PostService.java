package com.example.festival.community.service;

import com.example.festival.community.dto.PostDetailResponse;
import com.example.festival.community.dto.PostLikeResponse;
import com.example.festival.community.dto.PostRequest;
import com.example.festival.community.dto.PostSummaryResponse;
import com.example.festival.community.entity.Post;
import com.example.festival.community.entity.PostLike;
import com.example.festival.community.repository.PostCommentRepository;
import com.example.festival.community.repository.PostLikeRepository;
import com.example.festival.community.repository.PostRepository;
import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final PostCommentRepository postCommentRepository;
    private final PostLikeRepository postLikeRepository;
    private final MemberRepository memberRepository;

    public List<PostSummaryResponse> getPosts(String category, String keyword) {
        String normalizedCategory = (category == null || category.isBlank()) ? null : category;
        String normalizedKeyword = (keyword == null || keyword.isBlank()) ? null : keyword;

        List<Post> posts = postRepository.search(normalizedCategory, normalizedKeyword);

        return posts.stream()
                .map(post -> new PostSummaryResponse(
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
                ))
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
