package com.example.festival.artist.controller;

import com.example.festival.artist.dto.ArtistDetailResponse;
import com.example.festival.artist.service.ArtistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 아티스트 상세 조회 API. 공연 상세페이지 라인업에서 아티스트를 누르면 이걸로 이동한다.
 */
@RestController
@RequestMapping("/api/artists")
@RequiredArgsConstructor
public class ArtistController {

    private final ArtistService artistService;

    @GetMapping("/{artistId}")
    public ArtistDetailResponse getArtist(@PathVariable Long artistId) {
        return artistService.getArtist(artistId);
    }
}
