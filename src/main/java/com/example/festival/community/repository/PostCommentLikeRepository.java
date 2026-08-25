package com.example.festival.community.repository;

import com.example.festival.community.entity.PostCommentLike;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PostCommentLikeRepository extends JpaRepository<PostCommentLike, Long> {

    long countByPostComment_CommentId(Long commentId);

    boolean existsByPostComment_CommentIdAndMember_Id(Long commentId, Long memberId);

    void deleteByPostComment_CommentIdAndMember_Id(Long commentId, Long memberId);

    // 댓글 삭제 시 사용
    void deleteByPostComment_CommentId(Long commentId);

    // 게시글 삭제 시 사용: 그 글에 달린 모든 댓글의 좋아요를 한 번에 정리
    void deleteByPostComment_Post_PostId(Long postId);
}
