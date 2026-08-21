package com.example.festival.community.repository;

import com.example.festival.community.entity.PostLike;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    long countByPost_PostId(Long postId);

    Optional<PostLike> findByPost_PostIdAndMember_Id(Long postId, Long memberId);

    boolean existsByPost_PostIdAndMember_Id(Long postId, Long memberId);

    long deleteByPost_PostIdAndMember_Id(Long postId, Long memberId);

    // 프로필 - 좋아요 누른 글
    @Query("SELECT pl FROM PostLike pl JOIN FETCH pl.post p WHERE pl.member.id = :memberId ORDER BY pl.createdAt DESC")
    List<PostLike> findByMember_IdWithPostOrderByCreatedAtDesc(@Param("memberId") Long memberId);
}
