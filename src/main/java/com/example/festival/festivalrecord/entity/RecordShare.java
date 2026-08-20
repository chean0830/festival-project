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

@Entity
@Table(name = "record_share")
@Getter
@NoArgsConstructor
public class RecordShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "share_id")
    private Long shareId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private FestivalRecord record;

    @Column(name = "platform", nullable = false, length = 30)
    private String platform;

    @Column(name = "share_url", length = 500)
    private String shareUrl;

    @Column(name = "shared_at", insertable = false, updatable = false)
    private LocalDateTime sharedAt;

    private RecordShare(FestivalRecord record, String platform, String shareUrl) {
        this.record = record;
        this.platform = platform;
        this.shareUrl = shareUrl;
    }

    public static RecordShare of(FestivalRecord record, String platform, String shareUrl) {
        return new RecordShare(record, platform, shareUrl);
    }
}
