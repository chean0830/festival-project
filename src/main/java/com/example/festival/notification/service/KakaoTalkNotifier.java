package com.example.festival.notification.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.example.festival.member.entity.Member;
import com.example.festival.member.entity.SocialAccount;
import com.example.festival.member.entity.SocialProvider;
import com.example.festival.member.repository.MemberRepository;
import com.example.festival.member.repository.SocialAccountRepository;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * 카카오 로그인 시 talk_message 동의를 받은 회원에게, 카카오 "나에게 보내기" API로
 * 알림을 하나 더 보낸다. 사업자 인증이 필요한 친구톡/알림톡과 달리 무료이고,
 * 그 회원 본인의 카카오톡 "나와의 채팅"에만 도착한다.
 * <p>
 * 이 클래스가 실패해도(토큰 만료, API 에러 등) 예외를 절대 밖으로 던지지 않는다 —
 * 카카오톡 알림이 안 가더라도 사이트 내 알림 저장에는 영향이 없어야 하기 때문이다.
 */
@Slf4j
@Component
public class KakaoTalkNotifier {

    private final SocialAccountRepository socialAccountRepository;
    private final MemberRepository memberRepository;
    private final RestClient kapiClient = RestClient.create("https://kapi.kakao.com");
    private final RestClient kauthClient = RestClient.create("https://kauth.kakao.com");
    private final String kakaoClientId;
    private final String kakaoClientSecret;

    public KakaoTalkNotifier(
            SocialAccountRepository socialAccountRepository,
            MemberRepository memberRepository,
            @Value("${spring.security.oauth2.client.registration.kakao.client-id:}") String kakaoClientId,
            @Value("${spring.security.oauth2.client.registration.kakao.client-secret:}") String kakaoClientSecret
    ) {
        this.socialAccountRepository = socialAccountRepository;
        this.memberRepository = memberRepository;
        this.kakaoClientId = kakaoClientId;
        this.kakaoClientSecret = kakaoClientSecret;
    }

    /**
     * 회원이 카톡 알림을 켜뒀고 카카오 로그인 토큰이 있으면 "나에게 보내기"로 발송한다.
     * 그 외 모든 경우(미동의, 미로그인, 토큰 만료 후 갱신 실패 등)는 조용히 아무 일도 하지 않는다.
     */
    @Transactional
    public void sendIfOptedIn(Long memberId, String title, String content, String linkUrl) {
        try {
            Member member = memberRepository.findById(memberId).orElse(null);
            if (member == null || !member.isKakaoNotificationEnabled()) {
                return;
            }

            SocialAccount account = socialAccountRepository
                    .findByMember_IdAndProvider(memberId, SocialProvider.KAKAO)
                    .orElse(null);
            if (account == null || account.getKakaoAccessToken() == null) {
                return;
            }

            String accessToken = ensureValidAccessToken(account);
            if (accessToken == null) {
                return;
            }

            send(accessToken, title, content, linkUrl);
        } catch (Exception e) {
            log.warn("카카오톡 알림 발송을 건너뜁니다 (memberId={})", memberId, e);
        }
    }

    private String ensureValidAccessToken(SocialAccount account) {
        LocalDateTime expiresAt = account.getKakaoTokenExpiresAt();
        boolean expired = expiresAt != null && expiresAt.isBefore(LocalDateTime.now().plusMinutes(1));
        if (!expired) {
            return account.getKakaoAccessToken();
        }

        String refreshToken = account.getKakaoRefreshToken();
        if (refreshToken == null) {
            log.warn("카카오 access_token이 만료됐지만 refresh_token이 없습니다 (memberId={})",
                    account.getMember().getId());
            return null;
        }

        return refreshAccessToken(account, refreshToken);
    }

    private String refreshAccessToken(SocialAccount account, String refreshToken) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "refresh_token");
        form.add("client_id", kakaoClientId);
        form.add("refresh_token", refreshToken);
        if (kakaoClientSecret != null && !kakaoClientSecret.isBlank()) {
            form.add("client_secret", kakaoClientSecret);
        }

        try {
            TokenRefreshResponse response = kauthClient.post()
                    .uri("/oauth/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(TokenRefreshResponse.class);

            if (response == null || response.accessToken() == null) {
                return null;
            }

            LocalDateTime newExpiresAt = LocalDateTime.now().plusSeconds(response.expiresIn());
            account.updateKakaoTokens(response.accessToken(), response.refreshToken(), newExpiresAt);
            return response.accessToken();
        } catch (RestClientException e) {
            log.warn("카카오 access_token 갱신 실패 (memberId={})", account.getMember().getId(), e);
            return null;
        }
    }

    private void send(String accessToken, String title, String content, String linkUrl) {
        Map<String, Object> link = new LinkedHashMap<>();
        link.put("web_url", linkUrl);
        link.put("mobile_web_url", linkUrl);

        Map<String, Object> templateObject = new LinkedHashMap<>();
        templateObject.put("object_type", "text");
        templateObject.put("text", title + "\n" + content);
        templateObject.put("link", link);
        templateObject.put("button_title", "확인하기");

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("template_object", toJson(templateObject));

        kapiClient.post()
                .uri("/v2/api/talk/memo/default/send")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .toBodilessEntity();
    }

    private String toJson(Map<String, Object> map) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (!first) {
                sb.append(',');
            }
            first = false;
            sb.append('"').append(entry.getKey()).append("\":");
            appendJsonValue(sb, entry.getValue());
        }
        return sb.append('}').toString();
    }

    @SuppressWarnings("unchecked")
    private void appendJsonValue(StringBuilder sb, Object value) {
        if (value instanceof Map<?, ?>) {
            sb.append(toJson((Map<String, Object>) value));
        } else {
            String escaped = String.valueOf(value)
                    .replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n");
            sb.append('"').append(escaped).append('"');
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record TokenRefreshResponse(
            @JsonProperty("access_token") String accessToken,
            @JsonProperty("refresh_token") String refreshToken,
            @JsonProperty("expires_in") long expiresIn
    ) {
    }
}
