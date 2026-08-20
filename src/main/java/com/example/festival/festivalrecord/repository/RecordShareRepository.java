package com.example.festival.festivalrecord.repository;

import com.example.festival.festivalrecord.entity.RecordShare;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RecordShareRepository extends JpaRepository<RecordShare, Long> {

    void deleteAllByRecord_RecordId(Long recordId);
}
