package com.example.festival.festivalrecord.repository;

import com.example.festival.festivalrecord.entity.RecordFood;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecordFoodRepository extends JpaRepository<RecordFood, Long> {

    List<RecordFood> findAllByRecord_RecordId(Long recordId);

    void deleteAllByRecord_RecordId(Long recordId);
}
