package com.example.festival.genre.repository;

import com.example.festival.genre.entity.Genre;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GenreRepository extends JpaRepository<Genre, Long> {

    // 공연 상세용: 특정 공연의 장르 이름 목록
    @Query(value = "SELECT g.name FROM event_genre eg JOIN genre g ON g.genre_id = eg.genre_id "
            + "WHERE eg.event_id = :eventId ORDER BY g.name", nativeQuery = true)
    List<String> findGenreNamesByEventId(@Param("eventId") Long eventId);

    // 공연 목록용: 전체 공연-장르 이름 쌍 (EventService에서 event_id별로 묶어서 씀)
    @Query(value = "SELECT eg.event_id AS eventId, g.name AS genreName "
            + "FROM event_genre eg JOIN genre g ON g.genre_id = eg.genre_id "
            + "ORDER BY eg.event_id, g.name", nativeQuery = true)
    List<EventGenreNameProjection> findAllEventGenreNames();

    interface EventGenreNameProjection {
        Long getEventId();
        String getGenreName();
    }
}
