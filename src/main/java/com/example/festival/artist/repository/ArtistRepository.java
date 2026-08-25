package com.example.festival.artist.repository;

import com.example.festival.artist.entity.Artist;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArtistRepository extends JpaRepository<Artist, Long> {

    // 검색용: 이름에 검색어가 포함된 아티스트 조회 (대소문자 구분 없음)
    List<Artist> findByNameContainingIgnoreCase(String name);
}
