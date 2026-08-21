package com.example.festival.interest.repository;

import com.example.festival.interest.entity.MemberEvent;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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
}
