package com.example.festival.home.controller;

import com.example.festival.home.dto.EventDetailDto;
import com.example.festival.home.dto.EventSummaryDto;
import com.example.festival.home.dto.LineupArtistDto;
import com.example.festival.home.service.EventService;
import com.example.festival.weather.dto.WeatherForecastResponse;
import com.example.festival.weather.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 홈 화면 / 공연일정용 API.
 * 프론트 ProgramCarousel / 배너 / 공연 상세페이지에서 이 엔드포인트를 호출해서 실제 데이터를 받아가게 될 예정.
 */
@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final WeatherService weatherService;

    @GetMapping("/events")
    public List<EventSummaryDto> getUpcomingEvents() {
        return eventService.getUpcomingEvents();
    }

    @GetMapping("/events/{eventId}")
    public EventDetailDto getEventDetail(@PathVariable Long eventId) {
        return eventService.getEventDetail(eventId);
    }

    @GetMapping("/events/{eventId}/lineup")
    public List<LineupArtistDto> getEventLineup(@PathVariable Long eventId) {
        return eventService.getEventLineup(eventId);
    }

    @GetMapping("/events/{eventId}/weather")
    public WeatherForecastResponse getEventWeather(@PathVariable Long eventId) {
        return weatherService.getForecast(eventId);
    }
}
