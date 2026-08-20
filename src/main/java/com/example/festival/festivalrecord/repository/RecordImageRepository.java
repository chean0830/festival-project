package com.example.festival.festivalrecord.repository;

import com.example.festival.festivalrecord.entity.RecordImage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecordImageRepository extends JpaRepository<RecordImage, Long> {

    List<RecordImage> findAllByRecord_RecordIdOrderByImageIdAsc(Long recordId);

    Optional<RecordImage> findByImageIdAndRecord_RecordId(Long imageId, Long recordId);

    void deleteAllByRecord_RecordId(Long recordId);
}
