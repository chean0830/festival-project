package com.example.festival.nearby.dto;

public record NearbyPlaceDto(
        String id,
        String name,
        String category,
        String address,
        String phone,
        String placeUrl,
        Integer distanceMeters,
        Double latitude,
        Double longitude
) {
}
