package com.example.festival.interest.dto;

public record InterestedArtistResponse(
        Long artistId,
        String name,
        String artistType,
        String profileImageUrl
) {
}
