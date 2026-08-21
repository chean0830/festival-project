package com.example.festival.interest.repository;

import com.example.festival.interest.entity.MemberEvent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MemberEventRepository extends JpaRepository<MemberEvent, Long> {

    @Query("SELECT me FROM MemberEvent me JOIN FETCH me.event WHERE me.member.id = :memberId ORDER BY me.createdAt DESC")
    List<MemberEvent> findAllByMemberIdWithEvent(@Param("memberId") Long memberId);

    Optional<MemberEvent> findByMember_IdAndEvent_EventId(Long memberId, Long eventId);

    @Query("SELECT me FROM MemberEvent me JOIN FETCH me.event e "
            + "WHERE me.member.id = :memberId AND me.status = 'PLANNED' AND e.endDate >= CURRENT_DATE "
            + "ORDER BY e.startDate ASC")
    List<MemberEvent> findUpcomingByMemberId(@Param("memberId") Long memberId);

    /**
     * "예정된 공연"으로 등록해뒀는데 이미 끝난 공연들 (전 회원 기준).
     * PlannedEventAutoAttendScheduler가 "다녀온 공연"으로 자동 전환할 때 사용한다.
     */
    @Query("SELECT me FROM MemberEvent me JOIN FETCH me.member JOIN FETCH me.event e "
            + "WHERE me.status = 'PLANNED' AND e.endDate < CURRENT_DATE")
    List<MemberEvent> findAllPlannedWithEndedEvent();

    long deleteByMember_IdAndEvent_EventId(Long memberId, Long eventId);

    /**
     * "예정된 공연"으로 등록해뒀고, 시작일이 deadline(오늘 포함) 이내로 임박한 공연들 (전 회원 기준).
     * UpcomingEventReminderScheduler가 마감 임박 알림을 보낼 때 사용한다.
     */
    @Query("SELECT me FROM MemberEvent me JOIN FETCH me.member JOIN FETCH me.event e "
            + "WHERE me.status = 'PLANNED' AND e.startDate >= CURRENT_DATE AND e.startDate <= :deadline")
    List<MemberEvent> findAllPlannedStartingSoon(@Param("deadline") LocalDate deadline);

    // 인기순 정렬용: 공연별 찜(관심 등록) 수
    @Query("SELECT me.event.eventId AS eventId, COUNT(me) AS count "
            + "FROM MemberEvent me GROUP BY me.event.eventId")
    List<EventInterestCount> countByEventGroupByEvent();

    interface EventInterestCount {
        Long getEventId();
        long getCount();
    }
}
