package com.example.festival.member.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "member")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(length = 255)
    private String password;

    @Column(name = "phone_number", unique = true, length = 20)
    private String phoneNumber;

    @Column(name = "postal_code", length = 10)
    private String postalCode;

    @Column(name = "road_address", length = 255)
    private String roadAddress;

    @Column(name = "detail_address", length = 255)
    private String detailAddress;

    @Column(nullable = false, unique = true, length = 50)
    private String nickname;

    @Column(name = "profile_image", length = 500)
    private String profileImage;

    @Column(length = 500)
    private String introduction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberStatus status;

    @Column(name = "dark_mode", nullable = false)
    private boolean darkMode;

    @Column(name = "notification_enabled", nullable = false)
    private boolean notificationEnabled;

    @Column(name = "marketing_agree", nullable = false)
    private boolean marketingAgree;

    @Column(name = "push_enabled", nullable = false)
    private boolean pushEnabled;

    @Column(name = "email_enabled", nullable = false)
    private boolean emailEnabled;

    @Column(name = "kakao_notification_enabled", nullable = false)
    private boolean kakaoNotificationEnabled;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected Member() {
    }

    private Member(
            String email,
            String password,
            String phoneNumber,
            String postalCode,
            String roadAddress,
            String detailAddress,
            String nickname,
            String profileImage
    ) {
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.postalCode = postalCode;
        this.roadAddress = roadAddress;
        this.detailAddress = detailAddress;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.role = MemberRole.USER;
        this.status = MemberStatus.ACTIVE;
        this.notificationEnabled = true;
        this.pushEnabled = true;
        this.emailEnabled = true;
    }

    public static Member emailMember(
            String email,
            String encodedPassword,
            String phoneNumber,
            String postalCode,
            String roadAddress,
            String detailAddress,
            String nickname
    ) {
        return new Member(
                email,
                encodedPassword,
                phoneNumber,
                postalCode,
                roadAddress,
                detailAddress,
                nickname,
                null
        );
    }

    public static Member socialMember(String email, String nickname, String profileImage) {
        return new Member(email, null, null, null, null, null, nickname, profileImage);
    }

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void changeContact(String phoneNumber, String postalCode, String roadAddress, String detailAddress) {
        this.phoneNumber = phoneNumber;
        this.postalCode = postalCode;
        this.roadAddress = roadAddress;
        this.detailAddress = detailAddress;
    }

    public void withdraw() {
        this.status = MemberStatus.WITHDRAWN;
    }

    public void updateSocialProfile(String nickname, String profileImage) {
        if (nickname != null && !nickname.isBlank()) {
            this.nickname = nickname;
        }
        if (profileImage != null && !profileImage.isBlank()) {
            this.profileImage = profileImage;
        }
    }

    public void changeNickname(String nickname) {
        this.nickname = nickname;
    }

    public void changeIntroduction(String introduction) {
        this.introduction = introduction;
    }

    public void changeProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public void changeKakaoNotificationEnabled(boolean enabled) {
        this.kakaoNotificationEnabled = enabled;
    }

    public void clearProfileImage() {
        this.profileImage = null;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public String getRoadAddress() {
        return roadAddress;
    }

    public String getDetailAddress() {
        return detailAddress;
    }

    public String getNickname() {
        return nickname;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public String getIntroduction() {
        return introduction;
    }

    public MemberRole getRole() {
        return role;
    }

    public MemberStatus getStatus() {
        return status;
    }

    public boolean isKakaoNotificationEnabled() {
        return kakaoNotificationEnabled;
    }
}
