package com.example.festival.artist.service;

import com.example.festival.artist.dto.ArtistDetailResponse;
import com.example.festival.artist.entity.Artist;
import com.example.festival.artist.repository.ArtistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArtistService {

    private final ArtistRepository artistRepository;

    public ArtistDetailResponse getArtist(Long artistId) {
        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "아티스트를 찾을 수 없습니다."));

        return new ArtistDetailResponse(
                artist.getArtistId(),
                artist.getName(),
                artist.getArtistType(),
                artist.getProfileImage(),
                artist.getDebutDate(),
                artist.getDescription()
        );
    }
}
