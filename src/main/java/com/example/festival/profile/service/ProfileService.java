package com.example.festival.profile.service;

import com.example.festival.interest.entity.MemberEvent;
import com.example.festival.interest.repository.MemberArtistRepository;
import com.example.festival.interest.repository.MemberEventRepository;
import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import com.example.festival.notification.service.NotificationService;
import com.example.festival.profile.dto.AttendedEventResponse;
import com.example.festival.profile.dto.IntroductionUpdateRequest;
import com.example.festival.profile.dto.NicknameUpdateRequest;
import com.example.festival.profile.dto.ProfileImageResponse;
import com.example.festival.profile.dto.ProfileResponse;
import com.example.festival.profile.dto.ProfileStatsResponse;
import com.example.festival.profile.dto.UpcomingEventResponse;
import com.example.festival.event.entity.Event;
import com.example.festival.event.repository.EventRepository;
import com.example.festival.visit.entity.EventVisit;
import com.example.festival.visit.repository.EventVisitRepository;
import com.example.festival.visit.entity.VisitedEventGenre;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ProfileService {

    private static final String PROFILE_IMAGE_SUBDIR = "profile";
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final String EVENT_PLANNED_STATUS = "PLANNED";
    private static final String NOTIFICATION_TYPE_UPCOMING_EVENT = "UPCOMING_EVENT_REMINDER";
    private static final int UPCOMING_EVENT_REMINDER_DAYS_BEFORE = 3;
    private static final String NOTIFICATION_TYPE_ARTIST_EVENT = "ARTIST_EVENT";

    private final MemberRepository memberRepository;
    private final MemberEventRepository memberEventRepository;
    private final MemberArtistRepository memberArtistRepository;
    private final EventVisitRepository eventVisitRepository;
    private final EventRepository eventRepository;
    private final NotificationService notificationService;
    private final Path uploadRoot;

    public ProfileService(
            MemberRepository memberRepository,
            MemberEventRepository memberEventRepository,
            MemberArtistRepository memberArtistRepository,
            EventVisitRepository eventVisitRepository,
            EventRepository eventRepository,
            NotificationService notificationService,
            @Value("${file.upload-dir:uploads}") String uploadDir
    ) {
        this.memberRepository = memberRepository;
        this.memberEventRepository = memberEventRepository;
        this.memberArtistRepository = memberArtistRepository;
        this.eventVisitRepository = eventVisitRepository;
        this.eventRepository = eventRepository;
        this.notificationService = notificationService;
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public ProfileResponse getProfile(Long memberId) {
        Member member = getMemberOrThrow(memberId);
        return toProfileResponse(member);
    }

    @Transactional
    public ProfileResponse updateNickname(Long memberId, NicknameUpdateRequest request) {
        Member member = getMemberOrThrow(memberId);

        if (memberRepository.existsByNicknameAndIdNot(request.nickname(), memberId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다.");
        }

        member.changeNickname(request.nickname());
        return toProfileResponse(member);
    }

    @Transactional
    public ProfileResponse updateIntroduction(Long memberId, IntroductionUpdateRequest request) {
        Member member = getMemberOrThrow(memberId);
        member.changeIntroduction(request.introduction());
        return toProfileResponse(member);
    }

    @Transactional
    public ProfileImageResponse uploadProfileImage(Long memberId, MultipartFile file) {
        Member member = getMemberOrThrow(memberId);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일이 비어 있습니다.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "jpg, png, webp, gif 형식의 이미지만 등록할 수 있습니다.");
        }

        String previousImageUrl = member.getProfileImage();
        String storedFileName = storeFile(file, memberId);
        String publicUrl = "/uploads/" + PROFILE_IMAGE_SUBDIR + "/" + storedFileName;

        member.changeProfileImage(publicUrl);
        deletePhysicalFileIfExists(previousImageUrl);

        return new ProfileImageResponse(publicUrl);
    }

    @Transactional
    public void deleteProfileImage(Long memberId) {
        Member member = getMemberOrThrow(memberId);
        String previousImageUrl = member.getProfileImage();
        member.clearProfileImage();
        deletePhysicalFileIfExists(previousImageUrl);
    }

    public List<AttendedEventResponse> getAttendedEvents(Long memberId) {
        getMemberOrThrow(memberId);

        // 같은 공연을 여러 번 방문(체크인)했을 수 있으므로 이벤트 기준으로 중복 제거한다.
        Map<Long, AttendedEventResponse> byEventId = new LinkedHashMap<>();
        for (EventVisit visit : eventVisitRepository.findAllByMemberIdWithEvent(memberId)) {
            var event = visit.getEvent();
            byEventId.putIfAbsent(event.getEventId(), toAttendedEventResponse(event));
        }
        return List.copyOf(byEventId.values());
    }

    @Transactional
    public AttendedEventResponse addAttendedEvent(Long memberId, Long eventId) {
        Member member = getMemberOrThrow(memberId);
        EventVisit existing = eventVisitRepository.findFirstByMember_IdAndEvent_EventId(memberId, eventId).orElse(null);
        if (existing != null) {
            return toAttendedEventResponse(existing.getEvent());
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공연을 찾을 수 없습니다."));

        eventVisitRepository.save(new EventVisit(member, event, LocalDateTime.now(), false, false));
        return toAttendedEventResponse(event);
    }

    public List<UpcomingEventResponse> getUpcomingEvents(Long memberId) {
        getMemberOrThrow(memberId);

        return memberEventRepository.findUpcomingByMemberId(memberId).stream()
                .map(MemberEvent::getEvent)
                .map(this::toUpcomingEventResponse)
                .toList();
    }

    @Transactional
    public UpcomingEventResponse addUpcomingEvent(Long memberId, Long eventId) {
        Member member = getMemberOrThrow(memberId);
        MemberEvent existing = memberEventRepository.findByMember_IdAndEvent_EventId(memberId, eventId).orElse(null);
        if (existing != null) {
            if (existing.getEvent().getEndDate().isBefore(LocalDate.now())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 끝난 공연은 예정된 공연으로 추가할 수 없습니다.");
            }
            existing.changeStatus(EVENT_PLANNED_STATUS);
            return toUpcomingEventResponse(existing.getEvent());
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공연을 찾을 수 없습니다."));
        if (event.getEndDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 끝난 공연은 예정된 공연으로 추가할 수 없습니다.");
        }

        memberEventRepository.save(new MemberEvent(member, event, EVENT_PLANNED_STATUS));
        return toUpcomingEventResponse(event);
    }

    /**
     * "예정된 공연"(PLANNED)인데 이미 끝난 공연은 "다녀온 공연"으로 자동 전환한다.
     * PlannedEventAutoAttendScheduler가 주기적으로 호출한다.
     */
    @Transactional
    public void autoAttendEndedPlannedEvents() {
        LocalDateTime now = LocalDateTime.now();
        for (MemberEvent memberEvent : memberEventRepository.findAllPlannedWithEndedEvent()) {
            Member member = memberEvent.getMember();
            Event event = memberEvent.getEvent();
            boolean alreadyVisited = eventVisitRepository
                    .findFirstByMember_IdAndEvent_EventId(member.getId(), event.getEventId())
                    .isPresent();
            if (!alreadyVisited) {
                eventVisitRepository.save(new EventVisit(member, event, now, false, false));
            }
        }
    }

    /**
     * "예정된 공연"(PLANNED)의 시작일이 임박(D-3 이내)한 회원들에게 마감 임박 알림을 보낸다.
     * (memberId, eventId, type) 기준으로 이미 보낸 적 있으면 다시 보내지 않는다.
     * UpcomingEventReminderScheduler가 주기적으로 호출한다.
     */
    @Transactional
    public void notifyUpcomingEventReminders() {
        LocalDate deadline = LocalDate.now().plusDays(UPCOMING_EVENT_REMINDER_DAYS_BEFORE);

        for (MemberEvent memberEvent : memberEventRepository.findAllPlannedStartingSoon(deadline)) {
            Long memberId = memberEvent.getMember().getId();
            Event event = memberEvent.getEvent();
            Long eventId = event.getEventId();

            if (notificationService.hasNotified(memberId, eventId, NOTIFICATION_TYPE_UPCOMING_EVENT)) {
                continue;
            }

            long dDay = ChronoUnit.DAYS.between(LocalDate.now(), event.getStartDate());
            String dDayText = dDay <= 0 ? "오늘" : dDay + "일 후";
            notificationService.notifyMember(
                    memberId,
                    eventId,
                    NOTIFICATION_TYPE_UPCOMING_EVENT,
                    "예정된 공연이 곧 시작해요",
                    event.getName() + " 공연이 " + dDayText + " 시작해요."
            );
        }
    }

    /**
     * 관심 등록한 아티스트가 출연하는 공연의 시작일이 임박(D-3 이내)한 회원들에게 알림을 보낸다.
     * (memberId, eventId, type) 기준으로 이미 보낸 적 있으면 다시 보내지 않는다.
     * UpcomingArtistEventReminderScheduler가 주기적으로 호출한다.
     */
    @Transactional
    public void notifyUpcomingArtistEventReminders() {
        LocalDate deadline = LocalDate.now().plusDays(UPCOMING_EVENT_REMINDER_DAYS_BEFORE);

        for (MemberArtistRepository.ArtistUpcomingEventRow row
                : memberArtistRepository.findUpcomingEventsForInterestedArtists(deadline)) {
            Long memberId = row.getMemberId();
            Long eventId = row.getEventId();

            if (notificationService.hasNotified(memberId, eventId, NOTIFICATION_TYPE_ARTIST_EVENT)) {
                continue;
            }

            Event event = eventRepository.findById(eventId).orElse(null);
            if (event == null) {
                continue;
            }

            long dDay = ChronoUnit.DAYS.between(LocalDate.now(), event.getStartDate());
            String dDayText = dDay <= 0 ? "오늘" : dDay + "일 후";
            notificationService.notifyMember(
                    memberId,
                    eventId,
                    NOTIFICATION_TYPE_ARTIST_EVENT,
                    "관심 아티스트 공연이 곧 시작해요",
                    row.getArtistName() + " 출연 - " + event.getName() + " 공연이 " + dDayText + " 시작해요."
            );
        }
    }

    public ProfileStatsResponse getProfileStats(Long memberId) {
        getMemberOrThrow(memberId);

        Map<Long, Event> visitedEventsById = new LinkedHashMap<>();
        for (EventVisit visit : eventVisitRepository.findAllByMemberIdWithEvent(memberId)) {
            visitedEventsById.putIfAbsent(visit.getEvent().getEventId(), visit.getEvent());
        }

        int currentYear = LocalDate.now().getYear();
        long thisYearVisits = visitedEventsById.values().stream()
                .filter(event -> event.getStartDate().getYear() == currentYear)
                .count();

        Map<String, Long> genreCounts = new HashMap<>();
        for (VisitedEventGenre row : eventVisitRepository.findGenresForVisitedEvents(memberId)) {
            genreCounts.merge(row.getGenreName(), 1L, Long::sum);
        }
        String favoriteGenre = genreCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        return new ProfileStatsResponse(visitedEventsById.size(), thisYearVisits, favoriteGenre);
    }

    private Member getMemberOrThrow(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));
    }

    private UpcomingEventResponse toUpcomingEventResponse(Event event) {
        long dDay = ChronoUnit.DAYS.between(LocalDate.now(), event.getStartDate());
        return new UpcomingEventResponse(
                event.getEventId(),
                event.getName(),
                event.getPosterImage(),
                event.getStartDate(),
                event.getEndDate(),
                dDay
        );
    }

    private AttendedEventResponse toAttendedEventResponse(Event event) {
        return new AttendedEventResponse(
                event.getEventId(),
                event.getName(),
                event.getPosterImage(),
                event.getStartDate(),
                event.getEndDate(),
                event.getStartDate().getYear()
        );
    }

    private ProfileResponse toProfileResponse(Member member) {
        return new ProfileResponse(
                member.getId(),
                member.getNickname(),
                member.getProfileImage(),
                member.getIntroduction()
        );
    }

    private String storeFile(MultipartFile file, Long memberId) {
        try {
            Path targetDir = uploadRoot.resolve(PROFILE_IMAGE_SUBDIR);
            Files.createDirectories(targetDir);

            String extension = extractExtension(file.getOriginalFilename());
            String fileName = memberId + "_" + UUID.randomUUID() + extension;
            Path targetPath = targetDir.resolve(fileName).normalize();

            file.transferTo(targetPath);
            return fileName;
        } catch (IOException e) {
            throw new UncheckedIOException("프로필 이미지 저장에 실패했습니다.", e);
        }
    }

    private void deletePhysicalFileIfExists(String publicUrl) {
        if (publicUrl == null || publicUrl.isBlank()) {
            return;
        }
        String prefix = "/uploads/";
        if (!publicUrl.startsWith(prefix)) {
            return;
        }
        try {
            Path relativePath = Path.of(publicUrl.substring(prefix.length()));
            Path filePath = uploadRoot.resolve(relativePath).normalize();
            if (filePath.startsWith(uploadRoot)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            throw new UncheckedIOException("기존 프로필 이미지 삭제에 실패했습니다.", e);
        }
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        int dotIndex = originalFilename.lastIndexOf('.');
        return dotIndex >= 0 ? originalFilename.substring(dotIndex) : "";
    }
}
