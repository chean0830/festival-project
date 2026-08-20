package com.example.festival.artist.repository;

import com.example.festival.artist.entity.Artist;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ArtistRepository extends JpaRepository<Artist, Long> {
}
