package com.example.festival.member.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(
        name = "social_account",
        uniqueConstraints = @UniqueConstraint(columnNames = {"provider", "provider_id"})
)
public class SocialAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "social_account_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SocialProvider provider;

    @Column(name = "provider_id", nullable = false, length = 255)
    private String providerId;

    @Column(name = "kakao_access_token", length = 500)
    private String kakaoAccessToken;

    @Column(name = "kakao_refresh_token", length = 500)
    private String kakaoRefreshToken;

    @Column(name = "kakao_token_expires_at")
    private LocalDateTime kakaoTokenExpiresAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected SocialAccount() {
    }

    public SocialAccount(Member member, SocialProvider provider, String providerId) {
        this.member = member;
        this.provider = provider;
        this.providerId = providerId;
    }

    public void updateKakaoTokens(String accessToken, String refreshToken, LocalDateTime expiresAt) {
        this.kakaoAccessToken = accessToken;
        if (refreshToken != null) {
            this.kakaoRefreshToken = refreshToken;
        }
        this.kakaoTokenExpiresAt = expiresAt;
    }

    public Member getMember() {
        return member;
    }

    public SocialProvider getProvider() {
        return provider;
    }

    public String getKakaoAccessToken() {
        return kakaoAccessToken;
    }

    public String getKakaoRefreshToken() {
        return kakaoRefreshToken;
    }

    public LocalDateTime getKakaoTokenExpiresAt() {
        return kakaoTokenExpiresAt;
    }
}
