package com.example.festival.news.repository;

import com.example.festival.news.entity.EventNews;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventNewsRepository extends JpaRepository<EventNews, Long> {

    // 홈 화면 뉴스 섹션용: 최신순으로 최대 10개
    List<EventNews> findTop10ByOrderByCreatedAtDesc();

    // 뉴스 목록 페이지용: 전체 최신순
    List<EventNews> findAllByOrderByCreatedAtDesc();

    // 공연 상세페이지 소식 배너용: 해당 공연에 대한 소식만 최신순
    List<EventNews> findByEvent_EventIdOrderByCreatedAtDesc(Long eventId);
}
