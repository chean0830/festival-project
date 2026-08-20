package com.example.demo.profile.service;

import com.example.demo.badge.Badge;
import com.example.demo.badge.BadgeRepository;
import com.example.demo.badge.MemberBadge;
import com.example.demo.badge.MemberBadgeRepository;
import com.example.demo.event.Event;
import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import com.example.demo.profile.dto.BadgeResponse;
import com.example.demo.visit.EventVisit;
import com.example.demo.visit.EventVisitRepository;
import com.example.demo.visit.VisitedEventGenre;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * "나의 뱃지" 자동 부여 엔진. 프로필 담당 범위에서 신설한 기능이다.
 * badge.condition_type / condition_value를 해석해 event_visit 기록을 기준으로 조건 충족 여부를 계산하고,
 * 새로 충족된 뱃지는 즉시 member_badge에 적립(자동 부여)한다.
 *
 * condition_type 규약:
 *  - VISIT_COUNT      / value="N"          : 총 방문 공연 수 >= N
 *  - DOMESTIC_COUNT    / value="N"          : 국내(venue.country=KR) 방문 공연 수 >= N
 *  - OVERSEAS_COUNT    / value="N"          : 해외(venue.country<>KR) 방문 공연 수 >= N
 *  - GENRE_DIVERSITY  / value="N"          : 방문 공연에 태그된 서로 다른 장르 수 >= N
 *  - SEASON_COUNT     / value="시즌,N"      : 특정 시즌(SUMMER) 방문 공연 수 >= N
 *  - GENRE_COUNT      / value="장르키,N"    : 특정 장르(별칭 포함) 방문 공연 수 >= N
 */
@Service
@Transactional(readOnly = true)
public class BadgeService {

    private static final Map<String, Set<String>> GENRE_ALIASES = Map.of(
            "락", Set.of("락", "록", "rock"),
            "힙합", Set.of("힙합", "hiphop", "hip-hop", "hip hop")
    );

    private final MemberRepository memberRepository;
    private final BadgeRepository badgeRepository;
    private final MemberBadgeRepository memberBadgeRepository;
    private final EventVisitRepository eventVisitRepository;

    public BadgeService(
            MemberRepository memberRepository,
            BadgeRepository badgeRepository,
            MemberBadgeRepository memberBadgeRepository,
            EventVisitRepository eventVisitRepository
    ) {
        this.memberRepository = memberRepository;
        this.badgeRepository = badgeRepository;
        this.memberBadgeRepository = memberBadgeRepository;
        this.eventVisitRepository = eventVisitRepository;
    }

    @Transactional
    public List<BadgeResponse> getMyBadges(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));

        List<Badge> badges = badgeRepository.findAllByOrderByBadgeIdAsc();

        Map<Long, MemberBadge> earnedByBadgeId = memberBadgeRepository.findAllByMemberId(memberId).stream()
                .collect(Collectors.toMap(mb -> mb.getBadge().getBadgeId(), mb -> mb));

        BadgeMetrics metrics = computeMetrics(memberId);
        LocalDateTime now = LocalDateTime.now();

        List<BadgeResponse> result = new ArrayList<>();
        for (Badge badge : badges) {
            MemberBadge existing = earnedByBadgeId.get(badge.getBadgeId());
            if (existing != null) {
                result.add(new BadgeResponse(
                        badge.getBadgeId(), badge.getName(), badge.getDescription(), badge.getBadgeImage(),
                        true, false, existing.getAcquiredAt()));
                continue;
            }

            if (metrics.satisfies(badge)) {
                MemberBadge saved = memberBadgeRepository.save(new MemberBadge(member, badge, now));
                result.add(new BadgeResponse(
                        badge.getBadgeId(), badge.getName(), badge.getDescription(), badge.getBadgeImage(),
                        true, true, saved.getAcquiredAt()));
            } else {
                result.add(new BadgeResponse(
                        badge.getBadgeId(), badge.getName(), badge.getDescription(), badge.getBadgeImage(),
                        false, false, null));
            }
        }
        return result;
    }

    private BadgeMetrics computeMetrics(Long memberId) {
        List<EventVisit> visits = eventVisitRepository.findAllByMemberIdWithEvent(memberId);

        Map<Long, Event> visitedEventsById = new LinkedHashMap<>();
        for (EventVisit visit : visits) {
            Event event = visit.getEvent();
            visitedEventsById.putIfAbsent(event.getEventId(), event);
        }

        Map<Long, Set<String>> genresByEventId = new HashMap<>();
        for (VisitedEventGenre row : eventVisitRepository.findGenresForVisitedEvents(memberId)) {
            genresByEventId.computeIfAbsent(row.getEventId(), id -> new HashSet<>()).add(row.getGenreName());
        }

        return new BadgeMetrics(visitedEventsById, genresByEventId);
    }

    /**
     * 한 회원의 방문 기록으로부터 계산된 뱃지 판정용 집계치.
     */
    private static final class BadgeMetrics {
        private final long totalVisits;
        private final long domesticVisits;
        private final long overseasVisits;
        private final long summerVisits;
        private final long distinctGenreCount;
        private final Map<String, Long> genreVisitCounts;

        BadgeMetrics(Map<Long, Event> visitedEventsById, Map<Long, Set<String>> genresByEventId) {
            this.totalVisits = visitedEventsById.size();

            long domestic = 0;
            long overseas = 0;
            long summer = 0;
            for (Event event : visitedEventsById.values()) {
                String country = event.getVenue() != null ? event.getVenue().getCountry() : "KR";
                if ("KR".equalsIgnoreCase(country)) {
                    domestic++;
                } else {
                    overseas++;
                }
                int month = event.getStartDate().getMonthValue();
                if (month >= 6 && month <= 8) {
                    summer++;
                }
            }
            this.domesticVisits = domestic;
            this.overseasVisits = overseas;
            this.summerVisits = summer;

            Set<String> allGenres = new HashSet<>();
            genresByEventId.values().forEach(allGenres::addAll);
            this.distinctGenreCount = allGenres.size();

            Map<String, Long> genreCounts = new HashMap<>();
            for (String genreKey : GENRE_ALIASES.keySet()) {
                long count = visitedEventsById.keySet().stream()
                        .filter(eventId -> matchesGenre(genresByEventId.getOrDefault(eventId, Set.of()), genreKey))
                        .count();
                genreCounts.put(genreKey, count);
            }
            this.genreVisitCounts = genreCounts;
        }

        private static boolean matchesGenre(Set<String> eventGenreNames, String genreKey) {
            Set<String> aliases = GENRE_ALIASES.getOrDefault(genreKey, Set.of(genreKey));
            return eventGenreNames.stream()
                    .anyMatch(name -> aliases.stream().anyMatch(alias -> alias.equalsIgnoreCase(name)));
        }

        boolean satisfies(Badge badge) {
            String type = badge.getConditionType();
            String value = badge.getConditionValue();
            if (type == null || value == null) {
                return false;
            }

            return switch (type) {
                case "VISIT_COUNT" -> totalVisits >= parseLastLong(value);
                case "DOMESTIC_COUNT" -> domesticVisits >= parseLastLong(value);
                case "OVERSEAS_COUNT" -> overseasVisits >= parseLastLong(value);
                case "GENRE_DIVERSITY" -> distinctGenreCount >= parseLastLong(value);
                case "SEASON_COUNT" -> {
                    String[] parts = value.split(",");
                    boolean isSummer = parts.length > 0 && "SUMMER".equalsIgnoreCase(parts[0].trim());
                    yield isSummer && summerVisits >= parseLastLong(value);
                }
                case "GENRE_COUNT" -> {
                    String[] parts = value.split(",");
                    if (parts.length < 2) {
                        yield false;
                    }
                    String genreKey = parts[0].trim();
                    yield genreVisitCounts.getOrDefault(genreKey, 0L) >= parseLastLong(value);
                }
                default -> false;
            };
        }

        private static long parseLastLong(String value) {
            String[] parts = value.split(",");
            return Long.parseLong(parts[parts.length - 1].trim());
        }
    }
}
