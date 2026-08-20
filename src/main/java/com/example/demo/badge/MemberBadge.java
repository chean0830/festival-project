package com.example.demo.badge;

import com.example.demo.member.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * member_badge 매핑. "나의 뱃지" 기능(프로필 담당)에서 신설한 도메인이다.
 * BadgeEvaluationService가 조건 충족을 확인하면 이 테이블에 row를 생성(자동 부여)한다.
 */
@Entity
@Table(name = "member_badge")
@Getter
@NoArgsConstructor
public class MemberBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_badge_id")
    private Long memberBadgeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    @Column(name = "acquired_at", nullable = false)
    private LocalDateTime acquiredAt;

    public MemberBadge(Member member, Badge badge, LocalDateTime acquiredAt) {
        this.member = member;
        this.badge = badge;
        this.acquiredAt = acquiredAt;
    }
}
