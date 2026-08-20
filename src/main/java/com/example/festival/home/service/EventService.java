package com.example.festival.home.service;

import com.example.festival.event.entity.Event;
import com.example.festival.event.repository.EventRepository;
import com.example.festival.home.dto.EventDetailDto;
import com.example.festival.home.dto.EventSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepository;

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
                event.getVenue() != null ? event.getVenue().getAddress() : null
        );
    }

    public List<EventSummaryDto> getUpcomingEvents() {
        List<Event> events = eventRepository.findByStatusOrderByStartDateAsc("UPCOMING");

        return events.stream()
                .map(event -> new EventSummaryDto(
                        event.getEventId(),
                        event.getName(),
                        event.getVenue() != null ? event.getVenue().getName() : null,
                        event.getStartDate(),
                        event.getEndDate(),
                        event.getPosterImage()
                ))
                .toList();
    }
}
