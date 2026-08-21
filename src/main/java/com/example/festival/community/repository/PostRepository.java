package com.example.festival.community.repository;

import com.example.festival.community.entity.Post;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 커뮤니티 목록/검색: 카테고리(선택)/키워드(제목·내용, 선택) 조건으로 최신순 조회
    @Query("SELECT p FROM Post p WHERE "
            + "(:category IS NULL OR p.category = :category) AND "
            + "(:keyword IS NULL OR p.title LIKE %:keyword% OR p.content LIKE %:keyword%) "
            + "ORDER BY p.createdAt DESC")
    List<Post> search(@Param("category") String category, @Param("keyword") String keyword);
}
