package com.example.festival.search.service;

import com.example.festival.artist.entity.Artist;
import com.example.festival.artist.repository.ArtistRepository;
import com.example.festival.event.entity.Event;
import com.example.festival.event.repository.EventRepository;
import com.example.festival.search.dto.SearchResultDto;
import com.example.festival.search.util.HangulRomanizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchService {

    private final ArtistRepository artistRepository;
    private final EventRepository eventRepository;

    public List<SearchResultDto> search(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        Stream<SearchResultDto> artists = artistRepository.findAll().stream()
                .filter(artist -> matchesArtistName(artist, query))
                .map(this::toArtistResult);

        Stream<SearchResultDto> festivals = eventRepository.findByEventTypeAndNameContainingIgnoreCase("FESTIVAL", query).stream()
                .map(event -> toEventResult(event, "festival"));

        Stream<SearchResultDto> events = eventRepository.findByEventTypeAndNameContainingIgnoreCase("CONCERT", query).stream()
                .map(event -> toEventResult(event, "event"));

        return Stream.of(artists, festivals, events).flatMap(s -> s).toList();
    }

    // 이름 자체(한글/영문 표기)에 검색어가 포함되거나, 한글 이름을 로마자로 바꿨을 때
    // 검색어가 포함되면 매치로 본다. "Yuuri" 입력으로 "유우리"를 찾을 수 있는 건 이 덕분.
    private boolean matchesArtistName(Artist artist, String query) {
        String name = artist.getName();
        if (name == null) {
            return false;
        }
        String lowerQuery = query.toLowerCase(Locale.ROOT);
        if (name.toLowerCase(Locale.ROOT).contains(lowerQuery)) {
            return true;
        }
        return HangulRomanizer.romanize(name).contains(lowerQuery);
    }

    private SearchResultDto toArtistResult(Artist artist) {
        return new SearchResultDto(
                "artist-" + artist.getArtistId(),
                "artist",
                artist.getName(),
                artist.getArtistType() != null ? artist.getArtistType() : "아티스트",
                artist.getProfileImage(),
                null
        );
    }

    private SearchResultDto toEventResult(Event event, String type) {
        return new SearchResultDto(
                type + "-" + event.getEventId(),
                type,
                event.getName(),
                formatDate(event),
                event.getPosterImage(),
                event.getEndDate()
        );
    }

    private String formatDate(Event event) {
        String weekday = event.getStartDate().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.KOREAN);
        return "%d/%d (%s)".formatted(event.getStartDate().getMonthValue(), event.getStartDate().getDayOfMonth(), weekday);
    }
}
