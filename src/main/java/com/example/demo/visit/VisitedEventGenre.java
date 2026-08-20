package com.example.demo.visit;

/**
 * 방문한 공연의 (event_id, genre_name) 프로젝션. "나의 뱃지" 장르 조건 평가 전용.
 */
public interface VisitedEventGenre {
    Long getEventId();

    String getGenreName();
}
