package com.example.festival.festivalrecord.entity;

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
 * record_diary_version 매핑. AI 일기를 생성할 때마다 덮어쓰지 않고 버전으로 남겨서
 * 갤러리에서 이전에 만든 일기 중 하나를 다시 골라 쓸 수 있게 한다.
 */
@Entity
@Table(name = "record_diary_version")
@Getter
@NoArgsConstructor
public class RecordDiaryVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "version_id")
    private Long versionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private FestivalRecord record;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "summary", length = 1000)
    private String summary;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    private RecordDiaryVersion(FestivalRecord record, String content, String summary) {
        this.record = record;
        this.content = content;
        this.summary = summary;
    }

    public static RecordDiaryVersion of(FestivalRecord record, String content, String summary) {
        return new RecordDiaryVersion(record, content, summary);
    }
}
