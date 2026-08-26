package com.example.festival.tradechat.entity;

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
 * trade_chat_message 매핑. message_type은 TEXT/IMAGE, is_read는 상대방이 읽었는지 여부
 * (1:1 채팅이라 메시지 하나당 "읽음 대상"이 한 명뿐이라 boolean 하나로 충분하다).
 */
@Entity
@Table(name = "trade_chat_message")
@Getter
@NoArgsConstructor
public class TradeChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private TradeChatRoom room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Member sender;

    // TEXT, IMAGE
    @Column(name = "message_type", nullable = false, length = 20)
    private String messageType;

    @Column(name = "message", nullable = false, length = 1000)
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public TradeChatMessage(TradeChatRoom room, Member sender, String messageType, String message) {
        this.room = room;
        this.sender = sender;
        this.messageType = messageType;
        this.message = message;
        this.read = false;
    }

    public void markRead() {
        this.read = true;
    }
}
