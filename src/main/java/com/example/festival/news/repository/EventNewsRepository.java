package com.example.festival.news.repository;

import com.example.festival.news.entity.EventNews;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventNewsRepository extends JpaRepository<EventNews, Long> {

    // 홈 화면 뉴스 섹션용: 최신순으로 최대 10개
    List<EventNews> findTop10ByOrderByCreatedAtDesc();
}
