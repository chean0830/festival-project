package com.example.festival.community.repository;

import com.example.festival.community.entity.PostComment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    // 게시글 상세: 댓글 오래된 순 (프론트에서 parentId로 대댓글 묶어서 표시)
    List<PostComment> findByPost_PostIdOrderByCreatedAtAsc(Long postId);

    // 게시글 삭제 시 사용: 대댓글이 부모 댓글보다 항상 큰 id를 가지므로,
    // 이 순서로 하나씩 지우면 self-FK(parent_id) 위반 없이 지울 수 있음
    List<PostComment> findByPost_PostIdOrderByCommentIdDesc(Long postId);

    long countByPost_PostId(Long postId);

    boolean existsByParent_CommentId(Long parentCommentId);

    // 프로필 - 내가 쓴 댓글
    List<PostComment> findByMember_IdOrderByCreatedAtDesc(Long memberId);
}
