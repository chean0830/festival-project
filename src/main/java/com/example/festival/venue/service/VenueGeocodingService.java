package com.example.festival.venue.service;

import com.example.festival.venue.dto.KakaoAddressSearchResponse;
import com.example.festival.venue.entity.Venue;
import com.example.festival.venue.repository.VenueRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.util.List;

/**
 * venue.address만 있고 위도/경도가 비어 있는 공연장을 카카오 로컬 주소 검색 API로 채워준다.
 * (날씨 조회는 venue의 위도/경도가 있어야 동작하는데, SQL로 공연장을 직접 넣을 땐
 * 좌표를 안 넣고 주소만 넣는 경우가 많아서, 그걸 자동으로 보정해주는 배치.)
 * VenueGeocodingScheduler가 서버 기동 시 + 주기적으로 호출한다.
 */
@Slf4j
@Service
public class VenueGeocodingService {

    private final VenueRepository venueRepository;
    private final RestClient restClient;
    private final String apiKey;

    public VenueGeocodingService(
            VenueRepository venueRepository,
            @Value("${app.kakao.local-base-url}") String baseUrl,
            @Value("${app.kakao.local-api-key:}") String apiKey
    ) {
        this.venueRepository = venueRepository;
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    @Transactional
    public void fillMissingCoordinates() {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("카카오 로컬 API 키가 없어 venue 좌표 자동 채우기를 건너뜁니다.");
            return;
        }

        List<Venue> targets = venueRepository.findByLatitudeIsNullAndAddressIsNotNull();
        if (targets.isEmpty()) {
            return;
        }

        int filled = 0;
        for (Venue venue : targets) {
            Coordinate coordinate = geocode(venue.getAddress());
            if (coordinate == null) {
                log.warn("좌표를 찾지 못했습니다: venueId={}, address={}", venue.getVenueId(), venue.getAddress());
                continue;
            }
            venue.setLatitude(coordinate.latitude());
            venue.setLongitude(coordinate.longitude());
            filled++;
        }

        if (filled > 0) {
            log.info("venue 좌표 {}건을 카카오 로컬 API로 자동 채웠습니다.", filled);
        }
    }

    private Coordinate geocode(String address) {
        try {
            KakaoAddressSearchResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search/address.json")
                            .queryParam("query", address)
                            .build())
                    .header(HttpHeaders.AUTHORIZATION, "KakaoAK " + apiKey)
                    .retrieve()
                    .body(KakaoAddressSearchResponse.class);

            if (response == null || response.documents() == null || response.documents().isEmpty()) {
                return null;
            }

            KakaoAddressSearchResponse.Document doc = response.documents().get(0);
            return new Coordinate(new BigDecimal(doc.latitude()), new BigDecimal(doc.longitude()));
        } catch (RestClientException | NumberFormatException e) {
            log.warn("카카오 주소 검색 실패: address={}", address, e);
            return null;
        }
    }

    private record Coordinate(BigDecimal latitude, BigDecimal longitude) {
    }
}
