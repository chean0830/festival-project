package com.example.festival.festivalrecord.repository;

import com.example.festival.festivalrecord.entity.RecordDiaryVersion;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecordDiaryVersionRepository extends JpaRepository<RecordDiaryVersion, Long> {

    List<RecordDiaryVersion> findAllByRecord_RecordIdOrderByCreatedAtDesc(Long recordId);

    Optional<RecordDiaryVersion> findByVersionIdAndRecord_RecordId(Long versionId, Long recordId);

    void deleteAllByRecord_RecordId(Long recordId);
}
