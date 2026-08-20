package com.example.festival.badge.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * badge 매핑. "나의 뱃지" 기능(프로필 담당)에서 신설한 도메인이다.
 * condition_type / condition_value는 BadgeEvaluator가 해석하는 자동 부여 조건이다.
 */
@Entity
@Table(name = "badge")
@Getter
@NoArgsConstructor
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "badge_id")
    private Long badgeId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "condition_type", length = 50)
    private String conditionType;

    @Column(name = "condition_value", length = 100)
    private String conditionValue;

    @Column(name = "badge_image", length = 500)
    private String badgeImage;
}
