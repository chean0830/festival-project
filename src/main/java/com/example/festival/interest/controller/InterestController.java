package com.example.festival.interest.controller;

import com.example.festival.interest.dto.InterestStatusResponse;
import com.example.festival.interest.dto.InterestedArtistResponse;
import com.example.festival.interest.dto.InterestedEventResponse;
import com.example.festival.interest.service.InterestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 관심 아티스트 / 관심 공연(하트) API.
 * 메인 페이지, 공연/아티스트 상세페이지 등 어디서든 이 API로 하트를 등록/해제한다.
 */
@RestController
@RequestMapping("/api/members/{memberId}/interests")
public class InterestController {

    private final InterestService interestService;

    public InterestController(InterestService interestService) {
        this.interestService = interestService;
    }

    @GetMapping("/artists")
    public List<InterestedArtistResponse> getInterestedArtists(@PathVariable Long memberId) {
        return interestService.getInterestedArtists(memberId);
    }

    @GetMapping("/artists/{artistId}")
    public InterestStatusResponse getInterestedArtistStatus(@PathVariable Long memberId, @PathVariable Long artistId) {
        return interestService.getInterestedArtistStatus(memberId, artistId);
    }

    @PostMapping("/artists/{artistId}")
    public ResponseEntity<InterestedArtistResponse> addInterestedArtist(@PathVariable Long memberId, @PathVariable Long artistId) {
        InterestedArtistResponse response = interestService.addInterestedArtist(memberId, artistId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/artists/{artistId}")
    public ResponseEntity<Void> removeInterestedArtist(@PathVariable Long memberId, @PathVariable Long artistId) {
        interestService.removeInterestedArtist(memberId, artistId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/events")
    public List<InterestedEventResponse> getInterestedEvents(@PathVariable Long memberId) {
        return interestService.getInterestedEvents(memberId);
    }

    @GetMapping("/events/{eventId}")
    public InterestStatusResponse getInterestedEventStatus(@PathVariable Long memberId, @PathVariable Long eventId) {
        return interestService.getInterestedEventStatus(memberId, eventId);
    }

    @PostMapping("/events/{eventId}")
    public ResponseEntity<InterestedEventResponse> addInterestedEvent(@PathVariable Long memberId, @PathVariable Long eventId) {
        InterestedEventResponse response = interestService.addInterestedEvent(memberId, eventId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<Void> removeInterestedEvent(@PathVariable Long memberId, @PathVariable Long eventId) {
        interestService.removeInterestedEvent(memberId, eventId);
        return ResponseEntity.noContent().build();
    }
}
