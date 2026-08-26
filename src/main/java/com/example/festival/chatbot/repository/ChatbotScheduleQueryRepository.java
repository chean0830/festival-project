package com.example.festival.chatbot.repository;

import com.example.festival.event.entity.EventSchedule;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 챗봇 전용 조회 리포지토리: 아티스트 기준으로 공연 일정을 찾는다("XX밴드 몇 시야?").
 * event 도메인의 기존 EventScheduleRepository는 event_id 기준 조회만 제공하므로 수정하지 않고 별도로 추가한다.
 */
public interface ChatbotScheduleQueryRepository extends JpaRepository<EventSchedule, Long> {

    List<EventSchedule> findByArtist_ArtistIdInOrderByPerformanceStartAsc(List<Long> artistIds);
}
