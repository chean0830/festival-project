package com.example.festival.festivalrecord.repository;

import com.example.festival.festivalrecord.entity.FestivalRecord;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FestivalRecordRepository extends JpaRepository<FestivalRecord, Long> {

    @Query("SELECT fr FROM FestivalRecord fr JOIN FETCH fr.event WHERE fr.member.id = :memberId ORDER BY fr.createdAt DESC")
    List<FestivalRecord> findAllByMemberIdWithEvent(@Param("memberId") Long memberId);

    boolean existsByMember_IdAndEvent_EventId(Long memberId, Long eventId);
}
