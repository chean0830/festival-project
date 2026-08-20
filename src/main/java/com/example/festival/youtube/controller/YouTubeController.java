package com.example.festival.youtube.controller;

import com.example.festival.auth.security.MemberPrincipal;
import com.example.festival.youtube.dto.YouTubeBroadcastCreateRequest;
import com.example.festival.youtube.dto.YouTubeBroadcastSetupResponse;
import com.example.festival.youtube.dto.YouTubeConnectionStatusResponse;
import com.example.festival.youtube.service.YouTubeService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/youtube")
public class YouTubeController {

    private final YouTubeService youTubeService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public YouTubeController(YouTubeService youTubeService) {
        this.youTubeService = youTubeService;
    }

    @GetMapping("/oauth/authorize")
    public ResponseEntity<Void> authorize(
            @AuthenticationPrincipal MemberPrincipal principal,
            HttpSession session
    ) {
        String authorizationUrl = youTubeService.authorizationUrl(principal.getMemberId(), session);
        return ResponseEntity.status(302)
                .header(HttpHeaders.LOCATION, authorizationUrl)
                .build();
    }

    @GetMapping("/oauth/callback")
    public ResponseEntity<Void> callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            HttpSession session
    ) {
        if (error != null || code == null || state == null) {
            return ResponseEntity.status(302)
                    .location(URI.create(frontendUrl + "/live/new?youtube=denied"))
                    .build();
        }
        try {
            boolean liveEnabled = youTubeService.connect(code, state, session);
            String result = liveEnabled ? "connected" : "live-disabled";
            return ResponseEntity.status(302)
                    .location(URI.create(frontendUrl + "/live/new?youtube=" + result))
                    .build();
        } catch (ResponseStatusException exception) {
            URI location = UriComponentsBuilder.fromUriString(frontendUrl)
                    .path("/live/new")
                    .queryParam("youtube", "error")
                    .queryParam("message", exception.getReason())
                    .build()
                    .encode()
                    .toUri();
            return ResponseEntity.status(302).location(location).build();
        }
    }

    @GetMapping("/status")
    public YouTubeConnectionStatusResponse status(@AuthenticationPrincipal MemberPrincipal principal) {
        return youTubeService.getStatus(principal.getMemberId());
    }

    @PostMapping("/broadcasts")
    public YouTubeBroadcastSetupResponse createBroadcast(
            @AuthenticationPrincipal MemberPrincipal principal,
            @Valid @RequestBody YouTubeBroadcastCreateRequest request
    ) {
        return youTubeService.createBroadcast(principal.getMemberId(), request);
    }
}
