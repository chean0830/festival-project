package com.example.festival.home.service;

import com.example.festival.event.entity.Event;
import com.example.festival.event.repository.EventRepository;
import com.example.festival.home.dto.EventSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

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
