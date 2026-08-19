package com.example.demo.visit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventVisitRepository extends JpaRepository<EventVisit, Long> {

    @Query("SELECT ev FROM EventVisit ev JOIN FETCH ev.event e JOIN FETCH e.venue WHERE ev.member.memberId = :memberId ORDER BY e.startDate DESC")
    List<EventVisit> findAllByMemberIdWithEvent(@Param("memberId") Long memberId);

    /**
     * 방문한 공연들의 장르 태그를 (event_id, genre_name) 쌍으로 반환한다.
     * "나의 뱃지" 장르 조건(락 스피릿, 힙합 러버, 장르 컬렉터) 평가에만 사용하는 읽기 전용 조회.
     */
    @Query(value = "SELECT eg.event_id AS eventId, g.name AS genreName "
            + "FROM event_genre eg "
            + "JOIN genre g ON g.genre_id = eg.genre_id "
            + "WHERE eg.event_id IN (SELECT DISTINCT event_id FROM event_visit WHERE member_id = :memberId)",
            nativeQuery = true)
    List<VisitedEventGenre> findGenresForVisitedEvents(@Param("memberId") Long memberId);
}
