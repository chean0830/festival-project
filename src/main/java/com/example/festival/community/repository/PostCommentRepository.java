package com.example.festival.community.repository;

import com.example.festival.community.entity.PostComment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    // 게시글 상세: 댓글 오래된 순 (프론트에서 parentId로 대댓글 묶어서 표시)
    List<PostComment> findByPost_PostIdOrderByCreatedAtAsc(Long postId);

    long countByPost_PostId(Long postId);

    boolean existsByParent_CommentId(Long parentCommentId);
}
