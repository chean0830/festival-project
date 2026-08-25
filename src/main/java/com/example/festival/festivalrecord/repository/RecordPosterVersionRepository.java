package com.example.festival.festivalrecord.repository;

import com.example.festival.festivalrecord.entity.RecordPosterVersion;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecordPosterVersionRepository extends JpaRepository<RecordPosterVersion, Long> {

    List<RecordPosterVersion> findAllByRecord_RecordIdOrderByCreatedAtDesc(Long recordId);

    Optional<RecordPosterVersion> findByVersionIdAndRecord_RecordId(Long versionId, Long recordId);

    void deleteAllByRecord_RecordId(Long recordId);
}
