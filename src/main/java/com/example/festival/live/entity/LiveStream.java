package com.example.festival.live.entity;

import com.example.festival.event.entity.Event;
import com.example.festival.member.entity.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "live_stream")
public class LiveStream {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stream_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_member_id")
    private Member host;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 20)
    private LiveSourceType sourceType;

    @Column(name = "stream_url", length = 500)
    private String streamUrl;

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Column(name = "entrance_fee", nullable = false, precision = 10)
    private BigDecimal entranceFee;

    @Column(name = "ad_enabled", nullable = false)
    private boolean adEnabled;

    @Column(name = "chat_enabled", nullable = false)
    private boolean chatEnabled;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LiveStreamStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected LiveStream() {
    }

    private LiveStream(
            Event event,
            Member host,
            String title,
            String description,
            String thumbnailUrl,
            LiveSourceType sourceType,
            String streamUrl,
            BigDecimal entranceFee
    ) {
        this.event = event;
        this.host = host;
        this.title = title;
        this.description = description;
        this.thumbnailUrl = thumbnailUrl;
        this.sourceType = sourceType;
        this.streamUrl = streamUrl;
        this.entranceFee = entranceFee;
        this.adEnabled = false;
        this.chatEnabled = true;
        this.status = LiveStreamStatus.SCHEDULED;
    }

    public static LiveStream create(
            Event event,
            Member host,
            String title,
            String description,
            String thumbnailUrl,
            LiveSourceType sourceType,
            String streamUrl,
            BigDecimal entranceFee
    ) {
        return new LiveStream(event, host, title, description, thumbnailUrl, sourceType, streamUrl, entranceFee);
    }

    public void start(LocalDateTime now) {
        this.status = LiveStreamStatus.LIVE;
        this.startAt = now;
        this.endAt = null;
    }

    public void end(LocalDateTime now) {
        this.status = LiveStreamStatus.ENDED;
        this.endAt = now;
    }

    public void changeChatEnabled(boolean enabled) {
        this.chatEnabled = enabled;
    }

    public boolean isOwnedBy(Long memberId) {
        return host != null && host.getId().equals(memberId);
    }

    public Long getId() {
        return id;
    }

    public Event getEvent() {
        return event;
    }

    public Member getHost() {
        return host;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public String getStreamUrl() {
        return streamUrl;
    }

    public LiveSourceType getSourceType() {
        return sourceType;
    }

    public LocalDateTime getStartAt() {
        return startAt;
    }

    public LocalDateTime getEndAt() {
        return endAt;
    }

    public BigDecimal getEntranceFee() {
        return entranceFee;
    }

    public boolean isPaid() {
        return entranceFee != null && entranceFee.compareTo(BigDecimal.ZERO) > 0;
    }

    public LiveStreamStatus getStatus() {
        return status;
    }

    public boolean isChatEnabled() {
        return chatEnabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
