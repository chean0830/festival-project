package com.example.festival.chatbot.service;

import com.example.festival.artist.entity.Artist;
import com.example.festival.artist.repository.ArtistRepository;
import com.example.festival.chatbot.repository.ChatbotEventQueryRepository;
import com.example.festival.chatbot.repository.ChatbotScheduleQueryRepository;
import com.example.festival.event.entity.Event;
import com.example.festival.event.entity.EventSchedule;
import com.example.festival.event.repository.EventRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * 사실 질의(공연 시간/아티스트 시간/주차·입장/D-day)는 LLM을 거치지 않고
 * DB 조회 결과를 그대로 문장으로 조립한다 — "제공된 데이터에 없는 정보는 임의로 생성하지 않는다"는
 * 규칙을 이 경로에서는 100% 결정론적으로 지키기 위함이다.
 */
@Service
@Transactional(readOnly = true)
public class ChatbotFactService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("M월 d일");
    private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("M월 d일 HH:mm");
    private static final int DEFAULT_DDAY_WINDOW = 30;

    private final ChatbotEventQueryRepository chatbotEventQueryRepository;
    private final ChatbotScheduleQueryRepository chatbotScheduleQueryRepository;
    private final ArtistRepository artistRepository;
    private final EventRepository eventRepository;

    public ChatbotFactService(
            ChatbotEventQueryRepository chatbotEventQueryRepository,
            ChatbotScheduleQueryRepository chatbotScheduleQueryRepository,
            ArtistRepository artistRepository,
            EventRepository eventRepository
    ) {
        this.chatbotEventQueryRepository = chatbotEventQueryRepository;
        this.chatbotScheduleQueryRepository = chatbotScheduleQueryRepository;
        this.artistRepository = artistRepository;
        this.eventRepository = eventRepository;
    }

    public String answerEventInfo(String eventName, String rawMessage) {
        if (isParkingQuestion(rawMessage) || isEntryTimeQuestion(rawMessage)) {
            return answerVenueFact();
        }
        if (eventName == null || eventName.isBlank()) {
            return "어떤 공연에 대해 궁금하신가요? 공연 이름을 알려주세요.";
        }
        List<Event> matches = chatbotEventQueryRepository.findByNameContainingIgnoreCase(eventName);
        if (matches.isEmpty()) {
            return "\"" + eventName + "\" 공연 정보를 찾을 수 없어요. 이름을 다시 확인해주세요.";
        }
        Event event = matches.get(0);

        StringBuilder sb = new StringBuilder();
        sb.append(event.getName()).append("은(는) ")
                .append(event.getStartDate().format(DATE_FORMAT)).append("부터 ")
                .append(event.getEndDate().format(DATE_FORMAT)).append("까지 진행돼요.");
        if (event.getVenue() != null) {
            sb.append(" 장소는 ").append(event.getVenue().getName());
            if (event.getVenue().getAddress() != null && !event.getVenue().getAddress().isBlank()) {
                sb.append("(").append(event.getVenue().getAddress()).append(")");
            }
            sb.append("이에요.");
        }
        return sb.toString();
    }

    public String answerArtistTime(String artistName) {
        if (artistName == null || artistName.isBlank()) {
            return "어떤 아티스트의 공연 시간이 궁금하신가요? 아티스트 이름을 알려주세요.";
        }
        List<Artist> artists = artistRepository.findByNameContainingIgnoreCase(artistName);
        if (artists.isEmpty()) {
            return "\"" + artistName + "\" 아티스트 정보를 찾을 수 없어요.";
        }
        List<Long> artistIds = artists.stream().map(Artist::getArtistId).toList();
        List<EventSchedule> schedules = chatbotScheduleQueryRepository
                .findByArtist_ArtistIdInOrderByPerformanceStartAsc(artistIds);
        if (schedules.isEmpty()) {
            return "\"" + artistName + "\"의 예정된 공연 일정을 찾을 수 없어요.";
        }

        StringBuilder sb = new StringBuilder();
        for (EventSchedule schedule : schedules) {
            sb.append(schedule.getArtist().getName())
                    .append("은(는) ").append(schedule.getEvent().getName())
                    .append("에서 ").append(schedule.getPerformanceStart().format(DATETIME_FORMAT));
            if (schedule.getStageName() != null && !schedule.getStageName().isBlank()) {
                sb.append(" ").append(schedule.getStageName());
            }
            sb.append(" 무대에 올라요.\n");
        }
        return sb.toString().stripTrailing();
    }

    public String answerVenueFact() {
        return "죄송해요, 주차 가능 여부나 입장 가능 시간 정보는 아직 제공되지 않아요. 확인되지 않은 내용은 답해드릴 수 없어요.";
    }

    public String answerDday(Integer days) {
        int window = (days == null || days <= 0) ? DEFAULT_DDAY_WINDOW : days;
        LocalDate today = LocalDate.now();
        LocalDate deadline = today.plusDays(window);

        List<Event> upcoming = eventRepository.findByStatusOrderByStartDateAsc("UPCOMING").stream()
                .filter(e -> !e.getStartDate().isBefore(today) && !e.getStartDate().isAfter(deadline))
                .toList();

        if (upcoming.isEmpty()) {
            return window + "일 이내에 시작하는 공연이 없어요.";
        }

        StringBuilder sb = new StringBuilder(window + "일 이내에 시작하는 공연이에요:\n");
        for (Event event : upcoming) {
            long dDay = ChronoUnit.DAYS.between(today, event.getStartDate());
            sb.append("- ").append(event.getName())
                    .append(" (D-").append(dDay).append(", ")
                    .append(event.getStartDate().format(DATE_FORMAT)).append(" 시작)\n");
        }
        return sb.toString().stripTrailing();
    }

    private boolean isParkingQuestion(String message) {
        return message != null && message.contains("주차");
    }

    private boolean isEntryTimeQuestion(String message) {
        return message != null && (message.contains("입장") || message.contains("게이트"));
    }
}
