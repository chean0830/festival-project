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
 * record_poster_version 매핑. AI 포스터를 생성할 때마다 덮어쓰지 않고 버전으로 남겨서
 * 갤러리에서 이전에 만든 포스터 중 하나를 다시 골라 쓸 수 있게 한다.
 */
@Entity
@Table(name = "record_poster_version")
@Getter
@NoArgsConstructor
public class RecordPosterVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "version_id")
    private Long versionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private FestivalRecord record;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "style_request", length = 200)
    private String styleRequest;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    private RecordPosterVersion(FestivalRecord record, String imageUrl, String styleRequest) {
        this.record = record;
        this.imageUrl = imageUrl;
        this.styleRequest = styleRequest;
    }

    public static RecordPosterVersion of(FestivalRecord record, String imageUrl, String styleRequest) {
        return new RecordPosterVersion(record, imageUrl, styleRequest);
    }
}
