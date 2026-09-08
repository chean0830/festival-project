package com.example.festival.auth.service;

import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import com.example.festival.member.entity.SocialAccount;
import com.example.festival.member.repository.SocialAccountRepository;
import com.example.festival.member.entity.SocialProvider;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OAuth2AccountService {

    private final MemberRepository memberRepository;
    private final SocialAccountRepository socialAccountRepository;

    public OAuth2AccountService(
            MemberRepository memberRepository,
            SocialAccountRepository socialAccountRepository
    ) {
        this.memberRepository = memberRepository;
        this.socialAccountRepository = socialAccountRepository;
    }

    @Transactional
    public Member loginOrSignup(String registrationId, Map<String, Object> attributes) {
        SocialProvider provider = SocialProvider.valueOf(registrationId.toUpperCase(Locale.ROOT));
        SocialProfile profile = extractProfile(provider, attributes);

        return socialAccountRepository.findByProviderAndProviderId(provider, profile.providerId())
                .map(SocialAccount::getMember)
                .orElseGet(() -> createOrLinkMember(provider, profile));
    }

    /**
     * 카카오 로그인 성공 시 발급받은 access_token/refresh_token을 저장해둔다.
     * "나에게 보내기" 알림 기능에서 나중에 이 토큰으로 카카오 API를 호출하기 위함.
     */
    @Transactional
    public void saveKakaoTokens(Long memberId, String accessToken, String refreshToken, LocalDateTime expiresAt) {
        socialAccountRepository.findByMember_IdAndProvider(memberId, SocialProvider.KAKAO)
                .ifPresent(account -> account.updateKakaoTokens(accessToken, refreshToken, expiresAt));
    }

    private Member createOrLinkMember(SocialProvider provider, SocialProfile profile) {
        Member member = memberRepository.findByEmailIgnoreCase(profile.email())
                .orElseGet(() -> memberRepository.save(Member.socialMember(
                        profile.email(),
                        uniqueNickname(profile.nickname(), provider, profile.providerId()),
                        profile.profileImage()
                )));

        socialAccountRepository.save(new SocialAccount(member, provider, profile.providerId()));
        return member;
    }

    private SocialProfile extractProfile(SocialProvider provider, Map<String, Object> attributes) {
        return switch (provider) {
            case GOOGLE -> new SocialProfile(
                    requiredString(attributes.get("sub"), "Google 회원번호"),
                    requiredString(attributes.get("email"), "Google 이메일"),
                    stringValue(attributes.get("name")),
                    stringValue(attributes.get("picture"))
            );
            case KAKAO -> kakaoProfile(attributes);
            case NAVER -> naverProfile(attributes);
        };
    }

    private SocialProfile kakaoProfile(Map<String, Object> attributes) {
        Map<String, Object> account = mapValue(attributes.get("kakao_account"));
        Map<String, Object> profile = mapValue(account.get("profile"));
        return new SocialProfile(
                requiredString(attributes.get("id"), "카카오 회원번호"),
                requiredString(account.get("email"), "카카오 이메일"),
                stringValue(profile.get("nickname")),
                stringValue(profile.get("profile_image_url"))
        );
    }

    private SocialProfile naverProfile(Map<String, Object> attributes) {
        Map<String, Object> response = mapValue(attributes.get("response"));
        return new SocialProfile(
                requiredString(response.get("id"), "네이버 회원번호"),
                requiredString(response.get("email"), "네이버 이메일"),
                stringValue(response.get("nickname")),
                stringValue(response.get("profile_image"))
        );
    }

    private String uniqueNickname(String requested, SocialProvider provider, String providerId) {
        String base = requested == null || requested.isBlank()
                ? provider.name().toLowerCase(Locale.ROOT) + "_user"
                : requested.trim();
        if (base.length() > 40) {
            base = base.substring(0, 40);
        }
        if (!memberRepository.existsByNickname(base)) {
            return base;
        }

        String suffix = providerId.replaceAll("[^A-Za-z0-9]", "");
        if (suffix.length() > 8) {
            suffix = suffix.substring(suffix.length() - 8);
        }
        return (base + "_" + suffix).substring(0, Math.min(50, base.length() + suffix.length() + 1));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> mapValue(Object value) {
        return value instanceof Map<?, ?> map ? (Map<String, Object>) map : Map.of();
    }

    private String requiredString(Object value, String fieldName) {
        String result = stringValue(value);
        if (result == null || result.isBlank()) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("missing_user_info"),
                    fieldName + " 제공 동의가 필요합니다."
            );
        }
        return result;
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private record SocialProfile(String providerId, String email, String nickname, String profileImage) {
    }
}
