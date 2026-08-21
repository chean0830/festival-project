package com.example.festival.artist.dto;

import java.time.LocalDate;

public record ArtistDetailResponse(
        Long artistId,
        String name,
        String artistType,
        String profileImage,
        LocalDate debutDate,
        String description
) {
}
