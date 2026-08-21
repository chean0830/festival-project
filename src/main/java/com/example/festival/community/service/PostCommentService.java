package com.example.festival.community.service;

import com.example.festival.community.dto.PostCommentRequest;
import com.example.festival.community.dto.PostCommentResponse;
import com.example.festival.community.entity.Post;
import com.example.festival.community.entity.PostComment;
import com.example.festival.community.repository.PostCommentRepository;
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
public class PostCommentService {

    private final PostCommentRepository postCommentRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;

    public List<PostCommentResponse> getComments(Long postId) {
        return postCommentRepository.findByPost_PostIdOrderByCreatedAtAsc(postId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PostCommentResponse createComment(Long memberId, Long postId, PostCommentRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));

        PostComment parent = null;
        if (request.parentId() != null) {
            parent = postCommentRepository.findById(request.parentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "부모 댓글을 찾을 수 없습니다."));
            if (!parent.getPost().getPostId().equals(postId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "다른 게시글의 댓글에는 대댓글을 달 수 없습니다.");
            }
        }

        PostComment comment = new PostComment(post, member, parent, request.content());
        postCommentRepository.save(comment);
        return toResponse(comment);
    }

    @Transactional
    public void deleteComment(Long memberId, Long postId, Long commentId) {
        PostComment comment = postCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."));

        if (!comment.getPost().getPostId().equals(postId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "해당 게시글의 댓글이 아닙니다.");
        }
        if (!comment.getMember().getId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "본인 댓글만 삭제할 수 있습니다.");
        }
        if (postCommentRepository.existsByParent_CommentId(commentId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "답글이 달린 댓글은 삭제할 수 없습니다.");
        }

        postCommentRepository.delete(comment);
    }

    private PostCommentResponse toResponse(PostComment comment) {
        return new PostCommentResponse(
                comment.getCommentId(),
                comment.getParent() != null ? comment.getParent().getCommentId() : null,
                comment.getMember().getId(),
                comment.getMember().getNickname(),
                comment.getMember().getProfileImage(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}
