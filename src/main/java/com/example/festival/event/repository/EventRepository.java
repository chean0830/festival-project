package com.example.festival.event.repository;

import com.example.festival.event.entity.Event;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    // 홈 화면 캐러셀용: 특정 상태(예: UPCOMING)인 공연을 시작일 순으로 조회
    List<Event> findByStatusOrderByStartDateAsc(String status);
}
