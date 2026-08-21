package com.example.festival.news.entity;

import com.example.festival.artist.entity.Artist;
import com.example.festival.event.entity.Event;
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
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * event_news 테이블 매핑
 * 공연 소식 / 라인업 변경 / 공연 공지 / 새로운 소식
 */
@Entity
@Table(name = "event_news")
@Getter
@Setter
@NoArgsConstructor
public class EventNews {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "news_id")
    private Long newsId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id")
    private Artist artist;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    // LINEUP, SCHEDULE, NOTICE, PERFORMANCE, MD, ARTIST
    @Column(name = "news_type", nullable = false, length = 30)
    private String newsType;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
