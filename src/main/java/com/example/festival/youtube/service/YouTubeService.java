package com.example.festival.youtube.service;

import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import com.example.festival.youtube.dto.YouTubeBroadcastCreateRequest;
import com.example.festival.youtube.dto.YouTubeBroadcastSetupResponse;
import com.example.festival.youtube.dto.YouTubeConnectionStatusResponse;
import com.example.festival.youtube.entity.YouTubeConnection;
import com.example.festival.youtube.repository.YouTubeConnectionRepository;
import com.example.festival.youtube.security.YouTubeTokenCipher;
import jakarta.servlet.http.HttpSession;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class YouTubeService {

    private static final Logger log = LoggerFactory.getLogger(YouTubeService.class);
    private static final String OAUTH_STATE = "youtubeOAuthState";
    private static final String OAUTH_MEMBER_ID = "youtubeOAuthMemberId";
    private static final String YOUTUBE_SCOPE = "https://www.googleapis.com/auth/youtube.force-ssl";

    private final YouTubeConnectionRepository connectionRepository;
    private final MemberRepository memberRepository;
    private final YouTubeTokenCipher tokenCipher;
    private final RestClient restClient;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.youtube.client-id:}")
    private String clientId;

    @Value("${app.youtube.client-secret:}")
    private String clientSecret;

    @Value("${app.youtube.redirect-uri:}")
    private String redirectUri;

    @Value("${app.youtube.token-encryption-key:}")
    private String tokenEncryptionKey;

    public YouTubeService(
            YouTubeConnectionRepository connectionRepository,
            MemberRepository memberRepository,
            YouTubeTokenCipher tokenCipher
    ) {
        this.connectionRepository = connectionRepository;
        this.memberRepository = memberRepository;
        this.tokenCipher = tokenCipher;
        this.restClient = RestClient.create();
    }

    public String authorizationUrl(Long memberId, HttpSession session) {
        requireConfiguration();
        String state = randomState();
        session.setAttribute(OAUTH_STATE, state);
        session.setAttribute(OAUTH_MEMBER_ID, memberId);

        return "https://accounts.google.com/o/oauth2/v2/auth"
                + "?client_id=" + encode(clientId)
                + "&redirect_uri=" + encode(redirectUri)
                + "&response_type=code"
                + "&scope=" + encode(YOUTUBE_SCOPE)
                + "&access_type=offline"
                + "&include_granted_scopes=true"
                + "&prompt=consent"
                + "&state=" + encode(state);
    }

    @Transactional
    public boolean connect(String code, String state, HttpSession session) {
        requireConfiguration();
        String expectedState = (String) session.getAttribute(OAUTH_STATE);
        Object memberIdValue = session.getAttribute(OAUTH_MEMBER_ID);
        session.removeAttribute(OAUTH_STATE);
        session.removeAttribute(OAUTH_MEMBER_ID);

        if (expectedState == null || state == null || memberIdValue == null
                || !MessageDigest.isEqual(
                        expectedState.getBytes(StandardCharsets.UTF_8),
                        state.getBytes(StandardCharsets.UTF_8)
                )) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "YouTube 연결 요청이 만료되었습니다. 다시 시도해 주세요.");
        }

        Long memberId = (Long) memberIdValue;
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 정보를 찾을 수 없습니다."));

        Map<String, Object> tokenResponse = exchangeCode(code);
        String accessToken = requiredString(tokenResponse, "access_token");
        String refreshToken = stringValue(tokenResponse.get("refresh_token"));
        YouTubeConnection existing = connectionRepository.findByMember_Id(memberId).orElse(null);

        if ((refreshToken == null || refreshToken.isBlank()) && existing != null) {
            refreshToken = tokenCipher.decrypt(existing.getRefreshTokenEncrypted(), tokenEncryptionKey);
        }
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Google에서 장기 연결 토큰을 받지 못했습니다. YouTube 연결을 다시 시도해 주세요."
            );
        }

        ChannelProfile channel = getChannelProfile(accessToken);
        String encryptedRefreshToken = tokenCipher.encrypt(refreshToken, tokenEncryptionKey);
        if (existing == null) {
            connectionRepository.save(new YouTubeConnection(
                    member,
                    channel.channelId(),
                    channel.channelTitle(),
                    encryptedRefreshToken
            ));
        } else {
            existing.reconnect(channel.channelId(), channel.channelTitle(), encryptedRefreshToken);
        }

        try {
            return checkLiveEnabled(accessToken);
        } catch (ResponseStatusException exception) {
            // 라이브 권한 확인이 일시적으로 실패해도 OAuth 연결 정보는 유지한다.
            // 이후 /api/youtube/status에서 다시 확인하고 구체적인 안내를 제공한다.
            log.warn("YouTube account connected, but live permission check failed: {}", exception.getReason());
            return false;
        }
    }

    public YouTubeConnectionStatusResponse getStatus(Long memberId) {
        if (!isConfigured()) {
            return new YouTubeConnectionStatusResponse(
                    false, false, false, null,
                    "YouTube API 환경변수 설정이 필요합니다."
            );
        }

        YouTubeConnection connection = connectionRepository.findByMember_Id(memberId).orElse(null);
        if (connection == null) {
            return new YouTubeConnectionStatusResponse(
                    true, false, false, null,
                    "YouTube 계정을 연결해 주세요."
            );
        }

        try {
            String accessToken = refreshAccessToken(connection);
            boolean liveEnabled = checkLiveEnabled(accessToken);
            return new YouTubeConnectionStatusResponse(
                    true,
                    true,
                    liveEnabled,
                    connection.getChannelTitle(),
                    liveEnabled
                            ? "YouTube 라이브 방송을 만들 수 있습니다."
                            : "YouTube 채널에서 라이브 스트리밍을 먼저 활성화해 주세요."
            );
        } catch (ResponseStatusException exception) {
            return new YouTubeConnectionStatusResponse(
                    true, true, false, connection.getChannelTitle(), exception.getReason()
            );
        }
    }

    public YouTubeBroadcastSetupResponse createBroadcast(
            Long memberId,
            YouTubeBroadcastCreateRequest request
    ) {
        requireConfiguration();
        YouTubeConnection connection = connectionRepository.findByMember_Id(memberId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.PRECONDITION_REQUIRED,
                        "YouTube 계정을 먼저 연결해 주세요."
                ));
        String accessToken = refreshAccessToken(connection);

        Map<String, Object> broadcast = youtubePost(
                "https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails",
                accessToken,
                Map.of(
                        "snippet", Map.of(
                                "title", request.title().trim(),
                                "description", normalize(request.description()),
                                "scheduledStartTime", Instant.now().plusSeconds(60).toString()
                        ),
                        "status", Map.of(
                                "privacyStatus", "unlisted",
                                "selfDeclaredMadeForKids", false
                        ),
                        "contentDetails", Map.of(
                                "enableEmbed", true,
                                "enableAutoStart", true,
                                "enableAutoStop", true
                        )
                )
        );

        Map<String, Object> stream = youtubePost(
                "https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn,contentDetails",
                accessToken,
                Map.of(
                        "snippet", Map.of("title", request.title().trim() + " OBS Stream"),
                        "cdn", Map.of(
                                "frameRate", "variable",
                                "resolution", "variable",
                                "ingestionType", "rtmp"
                        ),
                        "contentDetails", Map.of("isReusable", false)
                )
        );

        String broadcastId = requiredString(broadcast, "id");
        String streamId = requiredString(stream, "id");
        Map<String, Object> ingestionInfo = mapValue(mapValue(stream.get("cdn")).get("ingestionInfo"));
        String obsServerUrl = stringValue(ingestionInfo.get("rtmpsIngestionAddress"));
        if (obsServerUrl == null) {
            obsServerUrl = requiredString(ingestionInfo, "ingestionAddress");
        }
        String streamKey = requiredString(ingestionInfo, "streamName");

        youtubePost(
                "https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?part=id,contentDetails&id="
                        + encode(broadcastId) + "&streamId=" + encode(streamId),
                accessToken,
                null
        );

        return new YouTubeBroadcastSetupResponse(
                broadcastId,
                "https://www.youtube.com/watch?v=" + broadcastId,
                obsServerUrl,
                streamKey
        );
    }

    public void completeBroadcastsOnLogout(Long memberId, List<String> broadcastIds) {
        if (broadcastIds == null || broadcastIds.isEmpty()) {
            return;
        }

        YouTubeConnection connection = connectionRepository.findByMember_Id(memberId).orElse(null);
        if (connection == null) {
            log.info("Skipping YouTube logout cleanup because member {} has no YouTube connection", memberId);
            return;
        }

        final String accessToken;
        try {
            accessToken = refreshAccessToken(connection);
        } catch (ResponseStatusException exception) {
            log.warn(
                    "Could not refresh YouTube token while ending broadcasts for member {}: {}",
                    memberId,
                    exception.getReason()
            );
            return;
        }

        for (String broadcastId : broadcastIds) {
            try {
                youtubePost(
                        "https://www.googleapis.com/youtube/v3/liveBroadcasts/transition"
                                + "?broadcastStatus=complete&part=status&id=" + encode(broadcastId),
                        accessToken,
                        null
                );
            } catch (ResponseStatusException exception) {
                // YouTube 종료 실패가 FESTLOG의 방송 종료와 로그아웃을 막지 않게 한다.
                log.warn(
                        "Could not complete YouTube broadcast {} during logout for member {}: {}",
                        broadcastId,
                        memberId,
                        exception.getReason()
                );
            }
        }
    }

    private Map<String, Object> exchangeCode(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", redirectUri);
        form.add("grant_type", "authorization_code");
        return googleTokenRequest(form);
    }

    private String refreshAccessToken(YouTubeConnection connection) {
        String refreshToken = tokenCipher.decrypt(connection.getRefreshTokenEncrypted(), tokenEncryptionKey);
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("refresh_token", refreshToken);
        form.add("grant_type", "refresh_token");
        return requiredString(googleTokenRequest(form), "access_token");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> googleTokenRequest(MultiValueMap<String, String> form) {
        try {
            return restClient.post()
                    .uri("https://oauth2.googleapis.com/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientResponseException exception) {
            log.warn(
                    "Google OAuth token request failed. status={}, body={}",
                    exception.getStatusCode(),
                    exception.getResponseBodyAsString()
            );
            String body = exception.getResponseBodyAsString().toLowerCase(Locale.ROOT);
            String message = body.contains("redirect_uri_mismatch")
                    ? "Google Cloud의 승인된 리디렉션 URI 설정을 확인해 주세요."
                    : "Google 인증 토큰을 발급받지 못했습니다. YouTube 계정을 다시 연결해 주세요.";
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    message
            );
        }
    }

    @SuppressWarnings("unchecked")
    private ChannelProfile getChannelProfile(String accessToken) {
        try {
            Map<String, Object> response = restClient.get()
                    .uri("https://www.googleapis.com/youtube/v3/channels?part=id,snippet&mine=true")
                    .headers(headers -> headers.setBearerAuth(accessToken))
                    .retrieve()
                    .body(Map.class);
            List<Object> items = listValue(response == null ? null : response.get("items"));
            if (items.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "연결한 Google 계정에 YouTube 채널이 없습니다.");
            }
            Map<String, Object> channel = mapValue(items.getFirst());
            Map<String, Object> snippet = mapValue(channel.get("snippet"));
            return new ChannelProfile(requiredString(channel, "id"), requiredString(snippet, "title"));
        } catch (RestClientResponseException exception) {
            throw youtubeError(exception);
        }
    }

    private boolean checkLiveEnabled(String accessToken) {
        try {
            restClient.get()
                    .uri("https://www.googleapis.com/youtube/v3/liveBroadcasts?part=id&mine=true&maxResults=1")
                    .headers(headers -> headers.setBearerAuth(accessToken))
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (RestClientResponseException exception) {
            String body = exception.getResponseBodyAsString();
            if (body.contains("liveStreamingNotEnabled") || body.contains("livePermissionBlocked")) {
                return false;
            }
            throw youtubeError(exception);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> youtubePost(String uri, String accessToken, Object body) {
        try {
            RestClient.RequestBodySpec request = restClient.post()
                    .uri(uri)
                    .headers(headers -> headers.setBearerAuth(accessToken))
                    .contentType(MediaType.APPLICATION_JSON);
            if (body != null) {
                request.body(body);
            }
            return request.retrieve().body(Map.class);
        } catch (RestClientResponseException exception) {
            throw youtubeError(exception);
        }
    }

    private ResponseStatusException youtubeError(RestClientResponseException exception) {
        String body = exception.getResponseBodyAsString();
        String normalizedBody = body.toLowerCase(Locale.ROOT);
        log.warn(
                "YouTube API request failed. status={}, body={}",
                exception.getStatusCode(),
                body
        );
        String message;
        if (normalizedBody.contains("accessnotconfigured")
                || normalizedBody.contains("service_disabled")
                || normalizedBody.contains("api has not been used")) {
            message = "Google Cloud에서 YouTube Data API v3를 사용 설정해 주세요.";
        } else if (normalizedBody.contains("youtubesignuprequired")) {
            message = "연결한 Google 계정에 YouTube 채널이 없습니다. YouTube 채널을 먼저 만들어 주세요.";
        } else if (body.contains("liveStreamingNotEnabled")) {
            message = "YouTube 라이브 권한이 활성화되지 않았습니다. 활성화 후 다시 시도해 주세요.";
        } else if (body.contains("livePermissionBlocked")) {
            message = "현재 YouTube 채널의 라이브 권한이 제한되어 있습니다.";
        } else if (body.contains("insufficientLivePermissions") || body.contains("insufficientPermissions")) {
            message = "YouTube 라이브 관리 권한이 부족합니다. 계정을 다시 연결해 주세요.";
        } else if (normalizedBody.contains("quotaexceeded")
                || normalizedBody.contains("dailylimitexceeded")
                || normalizedBody.contains("userratelimitexceeded")) {
            message = "YouTube API의 오늘 사용량 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.";
        } else if (normalizedBody.contains("invalidscheduledstarttime")) {
            message = "YouTube 방송 시작 시간을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.";
        } else if (exception.getStatusCode().value() == 403) {
            message = "YouTube API 권한 또는 사용량 한도를 확인해 주세요.";
        } else {
            message = "YouTube 방송을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
        }
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, message);
    }

    private void requireConfiguration() {
        if (!isConfigured()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "YouTube API 환경변수 설정이 필요합니다."
            );
        }
    }

    private boolean isConfigured() {
        return hasText(clientId) && hasText(clientSecret) && hasText(redirectUri)
                && tokenEncryptionKey != null && tokenEncryptionKey.length() >= 32;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private String randomState() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String requiredString(Map<String, Object> value, String key) {
        String result = stringValue(value == null ? null : value.get(key));
        if (result == null || result.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "YouTube 응답에 필요한 정보가 없습니다.");
        }
        return result;
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> mapValue(Object value) {
        return value instanceof Map<?, ?> map ? (Map<String, Object>) map : Map.of();
    }

    @SuppressWarnings("unchecked")
    private List<Object> listValue(Object value) {
        return value instanceof List<?> list ? (List<Object>) list : List.of();
    }

    private record ChannelProfile(String channelId, String channelTitle) {
    }
}
