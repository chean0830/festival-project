package com.example.festival.chatbot.service;

import com.example.festival.chatbot.repository.ChatbotEventQueryRepository;
import com.example.festival.chatbot.repository.ChatbotGenreQueryRepository;
import com.example.festival.event.entity.Event;
import com.example.festival.event.repository.EventRepository;
import com.example.festival.genre.repository.GenreRepository;
import com.example.festival.interest.entity.MemberArtist;
import com.example.festival.interest.repository.MemberArtistRepository;
import com.example.festival.visit.entity.EventVisit;
import com.example.festival.visit.entity.VisitedEventGenre;
import com.example.festival.visit.repository.EventVisitRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 개인화 추천/취향분석/코디 제안처럼 "이유 설명"이 필요한 의도를 위해
 * DB에서 조회한 사실을 텍스트 블록으로 만들어 반환한다.
 * 이 블록은 ChatbotService가 LLM 프롬프트에 근거 자료로 그대로 붙여넣는다 — LLM은 이 안에서만 설명을 구성해야 한다.
 */
@Service
@Transactional(readOnly = true)
public class ChatbotRecommendationService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("M월 d일");
    private static final Map<String, DayOfWeek> KOREAN_DAY_NAMES = Map.ofEntries(
            Map.entry("월요일", DayOfWeek.MONDAY), Map.entry("화요일", DayOfWeek.TUESDAY),
            Map.entry("수요일", DayOfWeek.WEDNESDAY), Map.entry("목요일", DayOfWeek.THURSDAY),
            Map.entry("금요일", DayOfWeek.FRIDAY), Map.entry("토요일", DayOfWeek.SATURDAY),
            Map.entry("일요일", DayOfWeek.SUNDAY)
    );

    private final EventRepository eventRepository;
    private final EventVisitRepository eventVisitRepository;
    private final MemberArtistRepository memberArtistRepository;
    private final GenreRepository genreRepository;
    private final ChatbotGenreQueryRepository chatbotGenreQueryRepository;
    private final ChatbotEventQueryRepository chatbotEventQueryRepository;

    public ChatbotRecommendationService(
            EventRepository eventRepository,
            EventVisitRepository eventVisitRepository,
            MemberArtistRepository memberArtistRepository,
            GenreRepository genreRepository,
            ChatbotGenreQueryRepository chatbotGenreQueryRepository,
            ChatbotEventQueryRepository chatbotEventQueryRepository
    ) {
        this.eventRepository = eventRepository;
        this.eventVisitRepository = eventVisitRepository;
        this.memberArtistRepository = memberArtistRepository;
        this.genreRepository = genreRepository;
        this.chatbotGenreQueryRepository = chatbotGenreQueryRepository;
        this.chatbotEventQueryRepository = chatbotEventQueryRepository;
    }

    private static final int CHAT_RECOMMENDATION_LIMIT = 10;

    public String buildPersonalRecommendationFacts(Long memberId) {
        Map<String, Long> genreCounts = aggregateGenrePreference(memberId);
        if (genreCounts.isEmpty()) {
            return "이 회원은 방문/관심 등록 이력이 없어 선호 장르를 파악할 수 없습니다. "
                    + "데이터가 부족하다는 점을 사실대로 안내하세요.";
        }
        List<Event> candidates = findTopPersonalizedCandidates(memberId, CHAT_RECOMMENDATION_LIMIT);

        StringBuilder sb = new StringBuilder();
        sb.append("이 회원의 선호 장르(방문/관심 이력 기반, 빈도순): ")
                .append(String.join(", ", genreCounts.keySet())).append("\n");
        sb.append("선호 장르에 해당하는 예정된 공연:\n");
        appendEventList(sb, candidates);
        return sb.toString();
    }

    /**
     * 선호 장르에 해당하는 예정 공연 중 가장 임박한 순으로 상위 limit개.
     * 챗봇 응답(buildPersonalRecommendationFacts)과 개인화 알림(PersonalizedRecommendationNotifier)이
     * 같은 매칭 로직을 공유하기 위한 공개 진입점.
     */
    public List<Event> findTopPersonalizedCandidates(Long memberId, int limit) {
        Map<String, Long> genreCounts = aggregateGenrePreference(memberId);
        if (genreCounts.isEmpty()) {
            return List.of();
        }
        return upcomingEventsByGenres(genreCounts.keySet()).stream()
                .filter(this::isActuallyUpcoming)
                .limit(limit)
                .toList();
    }

    public String buildByDayFacts(Long memberId, DayOfWeek dayOfWeek) {
        if (dayOfWeek == null) {
            return "어떤 요일인지 확인할 수 없습니다. 요일을 다시 물어봐야 한다고 안내하세요.";
        }
        Map<String, Long> genreCounts = aggregateGenrePreference(memberId);
        List<Event> onThatDay = eventRepository.findByStatusOrderByStartDateAsc("UPCOMING").stream()
                .filter(this::isActuallyUpcoming)
                .filter(e -> occursOnDayOfWeek(e, dayOfWeek))
                .toList();

        StringBuilder sb = new StringBuilder();
        sb.append(dayOfWeek).append("에 진행되는 예정된 공연:\n");
        appendEventList(sb, onThatDay);
        if (!genreCounts.isEmpty()) {
            sb.append("이 회원의 선호 장르: ").append(String.join(", ", genreCounts.keySet())).append("\n");
        }
        return sb.toString();
    }

    public String buildTasteAnalysisFacts(Long memberId) {
        Map<String, Long> genreCounts = aggregateGenrePreference(memberId);
        List<EventVisit> visits = eventVisitRepository.findAllByMemberIdWithEvent(memberId);
        List<MemberArtist> likedArtists = memberArtistRepository.findAllByMemberIdWithArtist(memberId);

        if (genreCounts.isEmpty() && visits.isEmpty() && likedArtists.isEmpty()) {
            return "이 회원은 다녀온 공연이나 관심 아티스트 등록이 없습니다. "
                    + "아직 분석할 데이터가 부족하다는 점을 사실대로 안내하세요.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("다녀온 공연 수: ").append(visits.size()).append("\n");
        sb.append("다녀온 공연 목록: ")
                .append(visits.stream().map(v -> v.getEvent().getName()).collect(Collectors.joining(", ")))
                .append("\n");
        sb.append("관심 등록한 아티스트: ")
                .append(likedArtists.stream().map(ma -> ma.getArtist().getName()).collect(Collectors.joining(", ")))
                .append("\n");
        sb.append("장르별 빈도(다녀온 공연 + 관심 아티스트 기준): ").append(genreCounts).append("\n");
        return sb.toString();
    }

    public String buildOutfitFacts(String eventName) {
        if (eventName == null || eventName.isBlank()) {
            return "특정 공연이 언급되지 않았습니다. 장르를 특정할 수 없으니 일반적인 페스티벌 코디를 제안하세요.";
        }
        List<Event> matches = chatbotEventQueryRepository.findByNameContainingIgnoreCase(eventName);
        if (matches.isEmpty()) {
            return "\"" + eventName + "\" 공연을 찾을 수 없습니다. 이름을 확인할 수 없다고 안내하거나 일반적인 코디를 제안하세요.";
        }
        Event event = matches.get(0);
        List<String> genres = genreRepository.findGenreNamesByEventId(event.getEventId());
        return event.getName() + "의 장르: " + (genres.isEmpty() ? "등록된 장르 정보 없음" : String.join(", ", genres));
    }

    /**
     * 분류기가 뽑은 dayOfWeek 슬롯을 우선 쓰고, 유효하지 않으면 원문 메시지에서 한글 요일을 다시 찾는다.
     */
    public DayOfWeek parseDayOfWeek(String slotValue, String rawMessage) {
        if (slotValue != null) {
            try {
                return DayOfWeek.valueOf(slotValue.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // 슬롯이 유효한 DayOfWeek 이름이 아니면 아래에서 원문 메시지를 확인한다.
            }
        }
        if (rawMessage == null) {
            return null;
        }
        for (Map.Entry<String, DayOfWeek> entry : KOREAN_DAY_NAMES.entrySet()) {
            if (rawMessage.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }

    private Map<String, Long> aggregateGenrePreference(Long memberId) {
        List<VisitedEventGenre> visitedGenres = eventVisitRepository.findGenresForVisitedEvents(memberId);
        List<MemberArtist> likedArtists = memberArtistRepository.findAllByMemberIdWithArtist(memberId);
        List<Long> artistIds = likedArtists.stream().map(ma -> ma.getArtist().getArtistId()).toList();
        List<ChatbotGenreQueryRepository.ArtistGenreRow> artistGenres = artistIds.isEmpty()
                ? List.of()
                : chatbotGenreQueryRepository.findGenreNamesForArtistIds(artistIds);

        Map<String, Long> counts = new LinkedHashMap<>();
        for (VisitedEventGenre row : visitedGenres) {
            counts.merge(row.getGenreName(), 1L, Long::sum);
        }
        for (ChatbotGenreQueryRepository.ArtistGenreRow row : artistGenres) {
            counts.merge(row.getGenreName(), 1L, Long::sum);
        }

        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (a, b) -> a, LinkedHashMap::new));
    }

    private List<Event> upcomingEventsByGenres(Set<String> genreNames) {
        List<Event> upcoming = eventRepository.findByStatusOrderByStartDateAsc("UPCOMING");
        if (genreNames.isEmpty()) {
            return upcoming;
        }
        Map<Long, List<String>> eventGenres = genreRepository.findAllEventGenreNames().stream()
                .collect(Collectors.groupingBy(
                        GenreRepository.EventGenreNameProjection::getEventId,
                        Collectors.mapping(GenreRepository.EventGenreNameProjection::getGenreName, Collectors.toList())
                ));
        return upcoming.stream()
                .filter(event -> eventGenres.getOrDefault(event.getEventId(), List.of()).stream().anyMatch(genreNames::contains))
                .toList();
    }

    /**
     * status='UPCOMING'이어도 시드/방치된 데이터라 실제로는 이미 끝난 날짜인 경우가 있어서
     * (예: 시딩 이후 상태값이 갱신되지 않은 경우) end_date로 한 번 더 방어한다.
     * D-day 조회(ChatbotFactService.answerDday)는 원래부터 날짜로 직접 필터링해서 이 문제가 없었다.
     */
    private boolean isActuallyUpcoming(Event event) {
        return !event.getEndDate().isBefore(LocalDate.now());
    }

    private boolean occursOnDayOfWeek(Event event, DayOfWeek target) {
        LocalDate date = event.getStartDate();
        LocalDate end = event.getEndDate();
        while (!date.isAfter(end)) {
            if (date.getDayOfWeek() == target) {
                return true;
            }
            date = date.plusDays(1);
        }
        return false;
    }

    private void appendEventList(StringBuilder sb, List<Event> events) {
        if (events.isEmpty()) {
            sb.append("- 없음\n");
            return;
        }
        for (Event event : events) {
            sb.append("- ").append(event.getName())
                    .append(" (").append(event.getStartDate().format(DATE_FORMAT))
                    .append("~").append(event.getEndDate().format(DATE_FORMAT)).append(")\n");
        }
    }
}
