package com.example.festival.nearby.controller;

import com.example.festival.nearby.dto.NearbyPlaceDto;
import com.example.festival.nearby.service.NearbyPlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * "내 주변 충전소" API — 홈 화면에서 현재 위치 기준 주변 음식점/카페 조회.
 */
@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class NearbyPlaceController {

    private final NearbyPlaceService nearbyPlaceService;

    @GetMapping("/nearby-places")
    public List<NearbyPlaceDto> getNearbyPlaces(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(required = false) Integer radius
    ) {
        return nearbyPlaceService.findNearbyPlaces(lat, lng, radius);
    }
}
