package com.example.festival.festivalrecord.repository;

import com.example.festival.festivalrecord.entity.RecordSong;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecordSongRepository extends JpaRepository<RecordSong, Long> {

    List<RecordSong> findAllByRecord_RecordId(Long recordId);

    void deleteAllByRecord_RecordId(Long recordId);
}
