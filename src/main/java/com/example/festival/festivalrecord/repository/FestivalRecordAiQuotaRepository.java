package com.example.festival.festivalrecord.repository;

import com.example.festival.festivalrecord.entity.FestivalRecordAiQuota;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FestivalRecordAiQuotaRepository extends JpaRepository<FestivalRecordAiQuota, Long> {

    Optional<FestivalRecordAiQuota> findByMember_IdAndEvent_EventId(Long memberId, Long eventId);
}
