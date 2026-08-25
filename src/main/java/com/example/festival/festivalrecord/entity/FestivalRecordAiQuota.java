package com.example.festival.festivalrecord.entity;

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

/**
 * festival_record_ai_quota 매핑.
 * AI 포스터 무료 생성 횟수(3회)를 festival_record가 아니라 (회원, 공연) 단위로 센다.
 * 기록을 삭제하고 같은 공연으로 새 기록을 다시 만들어도 무료 횟수가 초기화되지 않게 하기 위함.
 */
@Entity
@Table(name = "festival_record_ai_quota")
@Getter
@NoArgsConstructor
public class FestivalRecordAiQuota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quota_id")
    private Long quotaId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "used_count", nullable = false)
    private int usedCount;

    private FestivalRecordAiQuota(Member member, Event event) {
        this.member = member;
        this.event = event;
        this.usedCount = 0;
    }

    public static FestivalRecordAiQuota create(Member member, Event event) {
        return new FestivalRecordAiQuota(member, event);
    }

    public void increment() {
        this.usedCount += 1;
    }
}
