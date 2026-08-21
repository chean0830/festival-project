package com.example.festival.community.repository;

import com.example.festival.community.entity.PostLike;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    long countByPost_PostId(Long postId);

    Optional<PostLike> findByPost_PostIdAndMember_Id(Long postId, Long memberId);

    boolean existsByPost_PostIdAndMember_Id(Long postId, Long memberId);

    long deleteByPost_PostIdAndMember_Id(Long postId, Long memberId);
}
