package com.example.festival.live.controller;

import com.example.festival.auth.security.MemberPrincipal;
import com.example.festival.live.dto.LiveEventOptionResponse;
import com.example.festival.live.dto.LiveStreamCreateRequest;
import com.example.festival.live.dto.LiveStreamResponse;
import com.example.festival.live.service.LiveStreamService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/live-streams")
public class LiveStreamController {

    private final LiveStreamService liveStreamService;

    public LiveStreamController(LiveStreamService liveStreamService) {
        this.liveStreamService = liveStreamService;
    }

    @GetMapping
    public List<LiveStreamResponse> getLiveStreams() {
        return liveStreamService.getLiveStreams();
    }

    @GetMapping("/events")
    public List<LiveEventOptionResponse> getEvents() {
        return liveStreamService.getEvents();
    }

    @GetMapping("/watch/{streamId}")
    public LiveStreamResponse getWatchStream(
            @PathVariable Long streamId,
            @AuthenticationPrincipal MemberPrincipal principal
    ) {
        return liveStreamService.getWatchStream(streamId, principal == null ? null : principal.getMemberId());
    }

    @GetMapping("/mine")
    public List<LiveStreamResponse> getMyStreams(@AuthenticationPrincipal MemberPrincipal principal) {
        return liveStreamService.getMyStreams(principal.getMemberId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LiveStreamResponse create(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Valid @RequestBody LiveStreamCreateRequest request
    ) {
        return liveStreamService.create(principal.getMemberId(), request);
    }

    @PatchMapping("/{streamId}/start")
    public LiveStreamResponse start(
            @PathVariable Long streamId,
            @AuthenticationPrincipal MemberPrincipal principal
    ) {
        return liveStreamService.start(streamId, principal.getMemberId());
    }

    @PatchMapping("/{streamId}/end")
    public LiveStreamResponse end(
            @PathVariable Long streamId,
            @AuthenticationPrincipal MemberPrincipal principal
    ) {
        return liveStreamService.end(streamId, principal.getMemberId());
    }
}
