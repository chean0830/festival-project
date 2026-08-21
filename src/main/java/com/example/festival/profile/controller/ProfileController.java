package com.example.festival.profile.controller;

import com.example.festival.profile.dto.AttendedEventResponse;
import com.example.festival.profile.dto.BadgeResponse;
import com.example.festival.profile.dto.IntroductionUpdateRequest;
import com.example.festival.profile.dto.NicknameUpdateRequest;
import com.example.festival.profile.dto.ProfileImageResponse;
import com.example.festival.profile.dto.ProfileResponse;
import com.example.festival.profile.dto.ProfileStatsResponse;
import com.example.festival.profile.dto.UpcomingEventResponse;
import com.example.festival.profile.service.BadgeService;
import com.example.festival.profile.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 프로필 담당 API.
 * 로그인/인증이 아직 구현되지 않은 상태라, memberId를 경로로 직접 받는 방식으로 설계했다.
 * 추후 인증이 붙으면 컨트롤러 내부에서 SecurityContext 등으로 memberId를 얻어오도록 교체하면 된다.
 */
@RestController
@RequestMapping("/api/members/{memberId}")
public class ProfileController {

    private final ProfileService profileService;
    private final BadgeService badgeService;

    public ProfileController(ProfileService profileService, BadgeService badgeService) {
        this.profileService = profileService;
        this.badgeService = badgeService;
    }

    @GetMapping("/profile")
    public ProfileResponse getProfile(@PathVariable Long memberId) {
        return profileService.getProfile(memberId);
    }

    @PatchMapping("/profile/nickname")
    public ProfileResponse updateNickname(@PathVariable Long memberId, @Valid @RequestBody NicknameUpdateRequest request) {
        return profileService.updateNickname(memberId, request);
    }

    @PatchMapping("/profile/introduction")
    public ProfileResponse updateIntroduction(@PathVariable Long memberId, @Valid @RequestBody IntroductionUpdateRequest request) {
        return profileService.updateIntroduction(memberId, request);
    }

    @PostMapping(value = "/profile/image")
    public ProfileImageResponse uploadProfileImage(@PathVariable Long memberId, @RequestParam("file") MultipartFile file) {
        return profileService.uploadProfileImage(memberId, file);
    }

    @DeleteMapping("/profile/image")
    public ResponseEntity<Void> deleteProfileImage(@PathVariable Long memberId) {
        profileService.deleteProfileImage(memberId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/events/attended")
    public List<AttendedEventResponse> getAttendedEvents(@PathVariable Long memberId) {
        return profileService.getAttendedEvents(memberId);
    }

    @PostMapping("/events/attended/{eventId}")
    public ResponseEntity<AttendedEventResponse> addAttendedEvent(@PathVariable Long memberId, @PathVariable Long eventId) {
        AttendedEventResponse response = profileService.addAttendedEvent(memberId, eventId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/events/upcoming")
    public List<UpcomingEventResponse> getUpcomingEvents(@PathVariable Long memberId) {
        return profileService.getUpcomingEvents(memberId);
    }

    @PostMapping("/events/upcoming/{eventId}")
    public ResponseEntity<UpcomingEventResponse> addUpcomingEvent(@PathVariable Long memberId, @PathVariable Long eventId) {
        UpcomingEventResponse response = profileService.addUpcomingEvent(memberId, eventId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/badges")
    public List<BadgeResponse> getMyBadges(@PathVariable Long memberId) {
        return badgeService.getMyBadges(memberId);
    }

    @GetMapping("/stats")
    public ProfileStatsResponse getProfileStats(@PathVariable Long memberId) {
        return profileService.getProfileStats(memberId);
    }
}
