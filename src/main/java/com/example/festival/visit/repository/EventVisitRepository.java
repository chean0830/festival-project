package com.example.festival.visit.repository;

import com.example.festival.visit.entity.EventVisit;
import com.example.festival.visit.entity.VisitedEventGenre;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventVisitRepository extends JpaRepository<EventVisit, Long> {

    @Query("SELECT ev FROM EventVisit ev JOIN FETCH ev.event e JOIN FETCH e.venue WHERE ev.member.id = :memberId ORDER BY e.startDate DESC")
    List<EventVisit> findAllByMemberIdWithEvent(@Param("memberId") Long memberId);

    Optional<EventVisit> findFirstByMember_IdAndEvent_EventId(Long memberId, Long eventId);

    /**
     * GPS 인증된 방문 기록만 지도 핀용으로 조회 (venue 좌표 포함).
     */
    @Query("SELECT ev FROM EventVisit ev JOIN FETCH ev.event e JOIN FETCH e.venue "
            + "WHERE ev.member.id = :memberId AND ev.verified = true ORDER BY e.startDate DESC")
    List<EventVisit> findAllVerifiedByMemberIdWithEvent(@Param("memberId") Long memberId);

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

    /**
     * "다녀온 공연인데 아직 기록을 안 남겼으면 알림 보내기" 배치용 조회.
     * 이미 끝난 공연에 대한 방문 기록을 전 회원 기준으로 훑는다 (읽기 전용, 체크인 생성은 담당 범위 밖).
     */
    @Query("SELECT ev FROM EventVisit ev JOIN FETCH ev.member JOIN FETCH ev.event e WHERE e.endDate < CURRENT_DATE")
    List<EventVisit> findAllForEndedEvents();
}
