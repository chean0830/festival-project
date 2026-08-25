package com.example.festival.home.service;

import com.example.festival.event.entity.Event;
import com.example.festival.event.repository.EventRepository;
import com.example.festival.event.repository.EventScheduleRepository;
import com.example.festival.home.dto.EventDetailDto;
import com.example.festival.home.dto.EventSummaryDto;
import com.example.festival.home.dto.LineupArtistDto;
import com.example.festival.interest.repository.MemberEventRepository;
import com.example.festival.genre.repository.GenreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepository;
    private final EventScheduleRepository eventScheduleRepository;
    private final MemberEventRepository memberEventRepository;
    private final GenreRepository genreRepository;

    public EventDetailDto getEventDetail(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공연을 찾을 수 없습니다."));

        return new EventDetailDto(
                event.getEventId(),
                event.getName(),
                event.getEventType(),
                event.getDescription(),
                event.getPosterImage(),
                event.getStartDate(),
                event.getEndDate(),
                event.getTicketOpenAt(),
                event.getTicketUrl(),
                event.getStatus(),
                event.getVenue() != null ? event.getVenue().getName() : null,
                event.getVenue() != null ? event.getVenue().getAddress() : null,
                genreRepository.findGenreNamesByEventId(eventId)
        );
    }

    public List<LineupArtistDto> getEventLineup(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "공연을 찾을 수 없습니다.");
        }

        return eventScheduleRepository.findByEvent_EventIdOrderByLineupOrderAsc(eventId).stream()
                .map(schedule -> new LineupArtistDto(
                        schedule.getArtist().getArtistId(),
                        schedule.getArtist().getName(),
                        schedule.getArtist().getArtistType(),
                        schedule.getArtist().getProfileImage(),
                        schedule.getStageName(),
                        schedule.getPerformanceStart(),
                        schedule.getLineupOrder()
                ))
                .toList();
    }

    public List<EventSummaryDto> getUpcomingEvents() {
        List<Event> events = eventRepository.findByStatusOrderByStartDateAsc("UPCOMING");
        Map<Long, Long> popularityByEventId = memberEventRepository.countByEventGroupByEvent().stream()
                .collect(Collectors.toMap(
                        MemberEventRepository.EventInterestCount::getEventId,
                        MemberEventRepository.EventInterestCount::getCount
                ));
        Map<Long, List<String>> genresByEventId = genreRepository.findAllEventGenreNames().stream()
                .collect(Collectors.groupingBy(
                        GenreRepository.EventGenreNameProjection::getEventId,
                        Collectors.mapping(GenreRepository.EventGenreNameProjection::getGenreName, Collectors.toList())
                ));

        return events.stream()
                .map(event -> new EventSummaryDto(
                        event.getEventId(),
                        event.getName(),
                        event.getVenue() != null ? event.getVenue().getName() : null,
                        event.getStartDate(),
                        event.getEndDate(),
                        event.getPosterImage(),
                        toRegion(event),
                        toKind(event),
                        popularityByEventId.getOrDefault(event.getEventId(), 0L),
                        genresByEventId.getOrDefault(event.getEventId(), List.of())
                ))
                .toList();
    }

    // 페스티벌은 "어디서 열리는지"(venue.country)로, 콘서트는 "누가 출연하는지"(artist_country)로 국내/해외를 구분한다.
    // 예: SPYAIR 내한공연 → 공연장은 한국이지만 아티스트가 일본이라 international(내한공연)로 분류돼야 함.
    private String toRegion(Event event) {
        if ("FESTIVAL".equals(event.getEventType())) {
            if (event.getVenue() == null || !"KR".equals(event.getVenue().getCountry())) {
                return "international";
            }
            return "domestic";
        }

        return "KR".equals(event.getArtistCountry()) ? "domestic" : "international";
    }

    // event_type(FESTIVAL, CONCERT)을 프론트 카테고리 분류(festival, performance)에 맞춰 변환
    private String toKind(Event event) {
        return "FESTIVAL".equals(event.getEventType()) ? "festival" : "performance";
    }
}
