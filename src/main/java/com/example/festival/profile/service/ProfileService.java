package com.example.festival.profile.service;

import com.example.festival.interest.entity.MemberEvent;
import com.example.festival.interest.repository.MemberEventRepository;
import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import com.example.festival.profile.dto.AttendedEventResponse;
import com.example.festival.profile.dto.IntroductionUpdateRequest;
import com.example.festival.profile.dto.NicknameUpdateRequest;
import com.example.festival.profile.dto.ProfileImageResponse;
import com.example.festival.profile.dto.ProfileResponse;
import com.example.festival.profile.dto.ProfileStatsResponse;
import com.example.festival.profile.dto.UpcomingEventResponse;
import com.example.festival.event.entity.Event;
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

    private final MemberRepository memberRepository;
    private final MemberEventRepository memberEventRepository;
    private final EventVisitRepository eventVisitRepository;
    private final Path uploadRoot;

    public ProfileService(
            MemberRepository memberRepository,
            MemberEventRepository memberEventRepository,
            EventVisitRepository eventVisitRepository,
            @Value("${file.upload-dir:uploads}") String uploadDir
    ) {
        this.memberRepository = memberRepository;
        this.memberEventRepository = memberEventRepository;
        this.eventVisitRepository = eventVisitRepository;
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
            byEventId.putIfAbsent(event.getEventId(), new AttendedEventResponse(
                    event.getEventId(),
                    event.getName(),
                    event.getPosterImage(),
                    event.getStartDate(),
                    event.getEndDate(),
                    event.getStartDate().getYear()
            ));
        }
        return List.copyOf(byEventId.values());
    }

    public List<UpcomingEventResponse> getUpcomingEvents(Long memberId) {
        getMemberOrThrow(memberId);
        LocalDate today = LocalDate.now();

        return memberEventRepository.findUpcomingByMemberId(memberId).stream()
                .map(MemberEvent::getEvent)
                .map(event -> new UpcomingEventResponse(
                        event.getEventId(),
                        event.getName(),
                        event.getPosterImage(),
                        event.getStartDate(),
                        event.getEndDate(),
                        ChronoUnit.DAYS.between(today, event.getStartDate())
                ))
                .toList();
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
