package com.example.festival.nearby.service;

import com.example.festival.nearby.dto.KakaoCategoryResponse;
import com.example.festival.nearby.dto.NearbyPlaceDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * "내 주변 충전소" — 현재 위치 기준 주변 음식점/카페를 카카오 로컬 API로 검색한다.
 */
@Service
public class NearbyPlaceService {

    private static final int DEFAULT_RADIUS_METERS = 1000;
    private static final int RESULT_LIMIT = 15;

    private final RestClient restClient;
    private final String apiKey;

    public NearbyPlaceService(
            @Value("${app.kakao.local-base-url}") String baseUrl,
            @Value("${app.kakao.local-api-key}") String apiKey
    ) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    public List<NearbyPlaceDto> findNearbyPlaces(double latitude, double longitude, Integer radiusMeters) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "카카오 로컬 API 키가 설정되어 있지 않습니다.");
        }
        int radius = radiusMeters != null ? radiusMeters : DEFAULT_RADIUS_METERS;

        List<NearbyPlaceDto> places = new ArrayList<>();
        places.addAll(searchCategory("FD6", "음식점", latitude, longitude, radius));
        places.addAll(searchCategory("CE7", "카페", latitude, longitude, radius));

        return places.stream()
                .sorted(Comparator.comparing(NearbyPlaceDto::distanceMeters))
                .limit(RESULT_LIMIT)
                .toList();
    }

    private List<NearbyPlaceDto> searchCategory(
            String categoryGroupCode, String categoryLabel, double latitude, double longitude, int radius
    ) {
        KakaoCategoryResponse response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/category.json")
                        .queryParam("category_group_code", categoryGroupCode)
                        .queryParam("x", longitude)
                        .queryParam("y", latitude)
                        .queryParam("radius", radius)
                        .queryParam("sort", "distance")
                        .queryParam("size", 15)
                        .build())
                .header(HttpHeaders.AUTHORIZATION, "KakaoAK " + apiKey)
                .retrieve()
                .body(KakaoCategoryResponse.class);

        if (response == null || response.documents() == null) {
            return List.of();
        }

        return response.documents().stream()
                .map(doc -> toDto(doc, categoryLabel))
                .toList();
    }

    private NearbyPlaceDto toDto(KakaoCategoryResponse.Document doc, String categoryLabel) {
        return new NearbyPlaceDto(
                doc.id(),
                doc.placeName(),
                categoryLabel,
                doc.roadAddressName() != null && !doc.roadAddressName().isBlank() ? doc.roadAddressName() : doc.addressName(),
                doc.phone(),
                doc.placeUrl(),
                parseDistance(doc.distance()),
                parseCoordinate(doc.latitude()),
                parseCoordinate(doc.longitude())
        );
    }

    private Integer parseDistance(String distance) {
        try {
            return distance == null ? null : Integer.valueOf(distance);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Double parseCoordinate(String coordinate) {
        try {
            return coordinate == null ? null : Double.valueOf(coordinate);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
