package com.example.festival.weather.service;

import com.example.festival.event.entity.Event;
import com.example.festival.event.repository.EventRepository;
import com.example.festival.venue.entity.Venue;
import com.example.festival.weather.dto.OwmForecastResponse;
import com.example.festival.weather.dto.WeatherForecastResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 공연 날짜 날씨 조회 (OpenWeatherMap 5 Day / 3 Hour Forecast).
 * 무료 티어라 예보는 오늘부터 5일 이내 날짜만 제공됨 - 그 밖의 공연은 unavailable 처리.
 */
@Slf4j
@Service
public class WeatherService {

    private static final DateTimeFormatter DATE_ONLY = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final int FORECAST_HORIZON_DAYS = 5;

    private final EventRepository eventRepository;
    private final RestClient restClient;
    private final String apiKey;

    public WeatherService(
            EventRepository eventRepository,
            @Value("${app.weather.base-url}") String baseUrl,
            @Value("${app.weather.api-key:}") String apiKey
    ) {
        this.eventRepository = eventRepository;
        this.restClient = RestClient.create(baseUrl);
        this.apiKey = apiKey;
    }

    @Transactional(readOnly = true)
    public WeatherForecastResponse getForecast(Long eventId) {
        if (apiKey == null || apiKey.isBlank()) {
            return WeatherForecastResponse.unavailable("날씨 정보를 불러올 수 없어요.");
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공연을 찾을 수 없습니다."));
        Venue venue = event.getVenue();

        if (venue.getLatitude() == null || venue.getLongitude() == null) {
            return WeatherForecastResponse.unavailable("공연장 위치 정보가 없어 날씨를 확인할 수 없어요.");
        }

        LocalDate eventDate = event.getStartDate();
        LocalDate today = LocalDate.now();
        if (eventDate.isBefore(today) || eventDate.isAfter(today.plusDays(FORECAST_HORIZON_DAYS))) {
            return WeatherForecastResponse.unavailable("공연 %d일 전부터 날씨가 업데이트돼요.".formatted(FORECAST_HORIZON_DAYS));
        }

        OwmForecastResponse forecast;
        try {
            forecast = restClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/forecast")
                            .queryParam("lat", venue.getLatitude())
                            .queryParam("lon", venue.getLongitude())
                            .queryParam("appid", apiKey)
                            .queryParam("units", "metric")
                            .queryParam("lang", "kr")
                            .build())
                    .retrieve()
                    .body(OwmForecastResponse.class);
        } catch (RestClientException e) {
            log.warn("OpenWeatherMap 조회 실패 (eventId={})", eventId, e);
            return WeatherForecastResponse.unavailable("날씨 정보를 불러오지 못했어요.");
        }

        if (forecast == null || forecast.list() == null || forecast.list().isEmpty()) {
            return WeatherForecastResponse.unavailable("날씨 정보를 불러오지 못했어요.");
        }

        String targetDate = eventDate.format(DATE_ONLY);
        List<OwmForecastResponse.Entry> matches = forecast.list().stream()
                .filter(entry -> entry.dt_txt() != null && entry.dt_txt().startsWith(targetDate))
                .toList();

        if (matches.isEmpty()) {
            return WeatherForecastResponse.unavailable("아직 해당 날짜의 예보가 제공되지 않아요.");
        }

        double minTemp = matches.stream()
                .mapToDouble(e -> e.main().temp_min())
                .min().orElse(0);
        double maxTemp = matches.stream()
                .mapToDouble(e -> e.main().temp_max())
                .max().orElse(0);
        int rainChancePercent = (int) Math.round(matches.stream()
                .mapToDouble(e -> e.pop() == null ? 0 : e.pop())
                .max().orElse(0) * 100);

        OwmForecastResponse.Entry representative = matches.get(matches.size() / 2);
        String description = representative.weather() == null || representative.weather().isEmpty()
                ? null
                : representative.weather().get(0).description();
        String icon = representative.weather() == null || representative.weather().isEmpty()
                ? null
                : representative.weather().get(0).icon();

        return new WeatherForecastResponse(true, null, minTemp, maxTemp, rainChancePercent, description, icon);
    }
}
