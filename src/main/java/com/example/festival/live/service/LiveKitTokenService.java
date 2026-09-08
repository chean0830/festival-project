package com.example.festival.live.service;

import com.example.festival.live.dto.LiveKitConnectionResponse;
import com.example.festival.live.admission.service.LiveAdmissionAccessService;
import com.example.festival.live.entity.LiveSourceType;
import com.example.festival.live.entity.LiveStream;
import com.example.festival.live.entity.LiveStreamStatus;
import com.example.festival.live.repository.LiveStreamRepository;
import com.example.festival.member.entity.Member;
import com.example.festival.member.entity.MemberRole;
import com.example.festival.member.repository.MemberRepository;
import io.livekit.server.AccessToken;
import io.livekit.server.CanPublish;
import io.livekit.server.CanPublishData;
import io.livekit.server.CanSubscribe;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import java.time.Duration;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LiveKitTokenService {

    private static final Duration TOKEN_TTL = Duration.ofHours(2);

    private final LiveStreamRepository liveStreamRepository;
    private final MemberRepository memberRepository;
    private final LiveAdmissionAccessService admissionAccessService;
    private final String provider;
    private final String serverUrl;
    private final String apiKey;
    private final String apiSecret;

    public LiveKitTokenService(
            LiveStreamRepository liveStreamRepository,
            MemberRepository memberRepository,
            LiveAdmissionAccessService admissionAccessService,
            @Value("${app.live.provider:LOCAL}") String provider,
            @Value("${app.livekit.url:}") String serverUrl,
            @Value("${app.livekit.api-key:}") String apiKey,
            @Value("${app.livekit.api-secret:}") String apiSecret
    ) {
        this.liveStreamRepository = liveStreamRepository;
        this.memberRepository = memberRepository;
        this.admissionAccessService = admissionAccessService;
        this.provider = "LOCAL".equalsIgnoreCase(provider) ? "LOCAL" : "LIVEKIT";
        this.serverUrl = serverUrl;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    public LiveKitConnectionResponse createConnection(Long streamId, Long requesterId) {
        LiveStream stream = liveStreamRepository.findById(streamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "방송을 찾을 수 없습니다."));

        if (stream.getSourceType() != LiveSourceType.BROWSER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "브라우저 라이브 방송이 아닙니다.");
        }

        boolean publisher = stream.isOwnedBy(requesterId)
                && stream.getHost() != null
                && stream.getHost().getRole() == MemberRole.ADMIN;
        if (publisher) {
            if (stream.getStatus() == LiveStreamStatus.ENDED) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 종료된 방송입니다.");
            }
        } else if (stream.getStatus() != LiveStreamStatus.LIVE) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "현재 시청할 수 없는 방송입니다.");
        }

        if (!publisher) {
            admissionAccessService.requireAdmission(stream, requesterId);
        }

        String roomName = "festlog-live-" + streamId;
        if ("LOCAL".equals(provider)) {
            return new LiveKitConnectionResponse(null, null, roomName, publisher, provider);
        }

        verifyConfigured();
        String identity = publisher
                ? "host-" + requesterId
                : "viewer-" + (requesterId == null ? "guest" : requesterId) + "-" + UUID.randomUUID();
        String displayName = participantName(stream, requesterId, publisher);

        AccessToken accessToken = new AccessToken(apiKey, apiSecret);
        accessToken.setIdentity(identity);
        accessToken.setName(displayName);
        accessToken.setTtl(TOKEN_TTL.toMillis());
        accessToken.addGrants(
                new RoomJoin(true),
                new RoomName(roomName),
                new CanPublish(publisher),
                new CanSubscribe(true),
                new CanPublishData(true)
        );

        return new LiveKitConnectionResponse(serverUrl, accessToken.toJwt(), roomName, publisher, provider);
    }

    private String participantName(LiveStream stream, Long requesterId, boolean publisher) {
        if (publisher && stream.getHost() != null) {
            return stream.getHost().getNickname();
        }
        if (requesterId != null) {
            return memberRepository.findById(requesterId).map(Member::getNickname).orElse("시청자");
        }
        return "비회원 시청자";
    }

    private void verifyConfigured() {
        if (!StringUtils.hasText(serverUrl)
                || !StringUtils.hasText(apiKey)
                || !StringUtils.hasText(apiSecret)) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "LiveKit Cloud 연결 정보가 설정되지 않았습니다."
            );
        }
    }
}
