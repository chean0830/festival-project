package com.example.festival.event.entity;

import com.example.festival.artist.entity.Artist;
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
 * event_schedule 테이블 매핑
 * 공연별 아티스트 / 무대 / 시간 / 순서
 */
@Entity
@Table(name = "event_schedule")
@Getter
@Setter
@NoArgsConstructor
public class EventSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", nullable = false)
    private Artist artist;

    @Column(name = "stage_name", length = 100)
    private String stageName;

    @Column(name = "performance_start", nullable = false)
    private LocalDateTime performanceStart;

    @Column(name = "performance_end")
    private LocalDateTime performanceEnd;

    @Column(name = "lineup_order")
    private Integer lineupOrder;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
