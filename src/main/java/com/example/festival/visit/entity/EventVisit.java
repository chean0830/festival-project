package com.example.festival.visit.entity;

import com.example.festival.event.entity.Event;
import com.example.festival.member.entity.Member;
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
 * event_visit 매핑 (GPS 방문 인증 + 방문 기록 + 스탬프).
 * 이 테이블은 기존 festival.sql에 이미 정의되어 있으며, 새로 추가한 컬럼/테이블은 없다.
 * GPS 인증 기반 체크인 생성은 여전히 프로필 담당 범위가 아니며, 다른 담당자의 기능이다.
 * (2026-08-21: 사용자 요청으로 프로필 쪽에서 "검색해서 다녀온 공연 수동 추가" 기능을 별도로 구현함.
 *  GPS 인증과는 무관한 자기 신고 방식이라 verified=false, stampAcquired=false로 저장한다.)
 */
@Entity
@Table(name = "event_visit")
@Getter
@NoArgsConstructor
public class EventVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "visit_id")
    private Long visitId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "visited_at", nullable = false)
    private LocalDateTime visitedAt;

    @Column(name = "verified", nullable = false)
    private boolean verified;

    @Column(name = "stamp_acquired", nullable = false)
    private boolean stampAcquired;

    public EventVisit(Member member, Event event, LocalDateTime visitedAt, boolean verified, boolean stampAcquired) {
        this.member = member;
        this.event = event;
        this.visitedAt = visitedAt;
        this.verified = verified;
        this.stampAcquired = stampAcquired;
    }
}
