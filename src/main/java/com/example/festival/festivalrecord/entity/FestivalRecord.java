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
 * ai_diary/ai_summary는 AI 일기 생성 기능에서 함께 채워진다 (사용자가 입력한 정보를 바탕으로
 * Gemini 텍스트 모델이 일기 본문과 한 줄 요약을 같이 작성). ai_summary는 기록 목록 카드에 쓴다.
 * mood는 AI 포스터 생성 프롬프트에 사용한다.
 * 포스터 무료 생성 횟수 제한은 이 엔티티가 아니라 FestivalRecordAiQuota(회원+공연 단위)에서
 * 관리한다 — 기록을 지우고 같은 공연으로 새로 만들어도 무료 횟수가 초기화되지 않게 하기 위함.
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

    @Column(name = "mood", length = 100)
    private String mood;

    @Column(name = "poster_image_url", length = 500)
    private String posterImageUrl;

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

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    private FestivalRecord(Member member, Event event) {
        this.member = member;
        this.event = event;
        this.shared = false;
    }

    public static FestivalRecord create(Member member, Event event) {
        return new FestivalRecord(member, event);
    }

    public void changeEvent(Event event) {
        this.event = event;
    }

    public void updateContent(String title, String content, Integer rating, String oneLineReview, String memo, String hashtag, String mood) {
        this.title = title;
        this.content = content;
        this.rating = rating == null ? null : rating.byteValue();
        this.oneLineReview = oneLineReview;
        this.memo = memo;
        this.hashtag = hashtag;
        this.mood = mood;
    }

    public void markShared() {
        this.shared = true;
    }

    public void changePosterImage(String posterImageUrl) {
        this.posterImageUrl = posterImageUrl;
    }

    public void changeAiDiary(String aiDiary, String aiSummary) {
        this.aiDiary = aiDiary;
        this.aiSummary = aiSummary;
    }
}
