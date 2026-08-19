package com.example.demo.profile.dto;

public record InterestedArtistResponse(
        Long artistId,
        String name,
        String artistType,
        String profileImageUrl
) {
}
