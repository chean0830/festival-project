package com.example.demo.visit;

import com.example.demo.event.Event;
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
 * event_visit 매핑 (GPS 방문 인증 + 방문 기록 + 스탬프).
 * 이 테이블은 기존 festival.sql에 이미 정의되어 있으며, 새로 추가한 컬럼/테이블은 없다.
 * GPS 인증 자체(체크인 생성)는 프로필 담당 범위가 아니며, 다른 담당자의 기능이다.
 * 프로필에서는 "다녀온 공연" 목록을 보여주기 위해 읽기 전용으로만 사용한다.
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
}
