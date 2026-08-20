package com.example.festival.profile.dto;

public record InterestedArtistResponse(
        Long artistId,
        String name,
        String artistType,
        String profileImageUrl
) {
}
