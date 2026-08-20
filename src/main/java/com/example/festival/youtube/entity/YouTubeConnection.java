package com.example.festival.youtube.entity;

import com.example.festival.member.entity.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "youtube_connection")
public class YouTubeConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "youtube_connection_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false, unique = true)
    private Member member;

    @Column(name = "channel_id", nullable = false, length = 100)
    private String channelId;

    @Column(name = "channel_title", nullable = false, length = 200)
    private String channelTitle;

    @Column(name = "refresh_token_encrypted", nullable = false, length = 2000)
    private String refreshTokenEncrypted;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected YouTubeConnection() {
    }

    public YouTubeConnection(Member member, String channelId, String channelTitle, String refreshTokenEncrypted) {
        this.member = member;
        this.channelId = channelId;
        this.channelTitle = channelTitle;
        this.refreshTokenEncrypted = refreshTokenEncrypted;
    }

    public void reconnect(String channelId, String channelTitle, String refreshTokenEncrypted) {
        this.channelId = channelId;
        this.channelTitle = channelTitle;
        this.refreshTokenEncrypted = refreshTokenEncrypted;
    }

    public String getChannelTitle() {
        return channelTitle;
    }

    public String getRefreshTokenEncrypted() {
        return refreshTokenEncrypted;
    }
}
