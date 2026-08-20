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

import java.time.LocalDateTime;

/**
 * festival_record 테이블 매핑.
 * ai_diary/ai_summary/mood는 스키마상 존재하지만 AI 페스티벌 기록 기능(추후 작업)에서 채워지는
 * 필드라 지금은 사용하지 않는다. ai_regenerated_count는 포스터 무료 재생성 횟수(3회) 제한에
 * 실제로 사용 중 — 프론트 state로만 두면 페이지를 나갔다 들어오면 초기화돼서 결제 유도가 무의미해지므로 DB에 저장한다.
 */
@Entity
@Table(name = "festival_record")
@Getter
@NoArgsConstructor
public class FestivalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Long recordId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "title", length = 200)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "ai_diary", columnDefinition = "TEXT")
    private String aiDiary;

    @Column(name = "ai_summary", length = 1000)
    private String aiSummary;

    @Column(name = "mood", length = 30)
    private String mood;

    @Column(name = "rating")
    private Byte rating;

    @Column(name = "one_line_review", length = 200)
    private String oneLineReview;

    @Column(name = "memo", length = 500)
    private String memo;

    @Column(name = "hashtag", length = 300)
    private String hashtag;

    @Column(name = "is_shared", nullable = false)
    private boolean shared;

    @Column(name = "ai_regenerated_count", nullable = false)
    private int aiRegeneratedCount;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    private FestivalRecord(Member member, Event event) {
        this.member = member;
        this.event = event;
        this.shared = false;
        this.aiRegeneratedCount = 0;
    }

    public static FestivalRecord create(Member member, Event event) {
        return new FestivalRecord(member, event);
    }

    public void changeEvent(Event event) {
        this.event = event;
    }

    public void updateContent(String title, String content, Integer rating, String oneLineReview, String memo, String hashtag) {
        this.title = title;
        this.content = content;
        this.rating = rating == null ? null : rating.byteValue();
        this.oneLineReview = oneLineReview;
        this.memo = memo;
        this.hashtag = hashtag;
    }

    public void markShared() {
        this.shared = true;
    }

    public void incrementAiRegeneratedCount() {
        this.aiRegeneratedCount += 1;
    }
}
