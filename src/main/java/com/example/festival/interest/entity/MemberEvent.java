package com.example.festival.interest.entity;

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
 * member_event 매핑 (관심 공연).
 * 메인 페이지에서 하트를 누르면 이 테이블에 row가 생성/삭제되는 구조를 전제로 한다.
 * 이 엔티티/Repository는 프로필(조회)과 메인 페이지(등록/삭제) 담당자가 함께 사용하는 공용 데이터 구조다.
 * 프로필 담당 범위에서는 조회만 구현하며, 등록/삭제 API는 만들지 않는다.
 */
@Entity
@Table(name = "member_event")
@Getter
@NoArgsConstructor
public class MemberEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_event_id")
    private Long memberEventId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
