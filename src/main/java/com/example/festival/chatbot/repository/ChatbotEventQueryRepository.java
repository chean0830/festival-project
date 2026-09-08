package com.example.festival.chatbot.repository;

import com.example.festival.event.entity.Event;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 챗봇 전용 조회 리포지토리. event 도메인의 기존 파일은 건드리지 않고,
 * 챗봇에 필요한 쿼리만 이 패키지 안에 별도로 둔다.
 */
public interface ChatbotEventQueryRepository extends JpaRepository<Event, Long> {

    List<Event> findByNameContainingIgnoreCase(String name);
}
