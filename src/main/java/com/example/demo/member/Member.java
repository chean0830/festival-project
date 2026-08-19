package com.example.demo.member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * DB 스키마(database/festival.sql)의 member 테이블 전체를 매핑하는 공용 엔티티.
 * 프로필 담당 범위에서 필요한 필드(nickname, profileImage, introduction)만 실제로 사용하며,
 * 나머지 필드(role, status, 알림/설정 관련)는 다른 담당자(석철: 소셜로그인/설정)의 작업을 위해
 * 스키마와 어긋나지 않도록 매핑만 해둔 것이다.
 */
@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long memberId;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password")
    private String password;

    @Column(name = "nickname", nullable = false, unique = true, length = 50)
    private String nickname;

    @Column(name = "profile_image", length = 500)
    private String profileImage;

    @Column(name = "introduction", length = 500)
    private String introduction;

    @Column(name = "role", nullable = false, length = 20)
    private String role;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "dark_mode", nullable = false)
    private Boolean darkMode;

    @Column(name = "notification_enabled", nullable = false)
    private Boolean notificationEnabled;

    @Column(name = "marketing_agree", nullable = false)
    private Boolean marketingAgree;

    @Column(name = "push_enabled", nullable = false)
    private Boolean pushEnabled;

    @Column(name = "email_enabled", nullable = false)
    private Boolean emailEnabled;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
