package com.example.festival.venue.scheduler;

import com.example.festival.venue.service.VenueGeocodingService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 주소만 있고 위도/경도가 비어 있는 venue를 카카오 로컬 API로 자동 채우는 배치.
 * 서버 기동 직후 한 번 실행하고(SQL로 새 공연장을 추가한 직후 바로 반영되도록),
 * 이후 24시간마다 반복한다.
 */
@Component
public class VenueGeocodingScheduler {

    private final VenueGeocodingService venueGeocodingService;

    public VenueGeocodingScheduler(VenueGeocodingService venueGeocodingService) {
        this.venueGeocodingService = venueGeocodingService;
    }

    @Scheduled(initialDelay = 0, fixedDelay = 24 * 60 * 60 * 1000)
    public void fillMissingVenueCoordinates() {
        venueGeocodingService.fillMissingCoordinates();
    }
}
