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

    long deleteByMember_IdAndEvent_EventId(Long memberId, Long eventId);
}
