package com.example.festival.tradechat.entity;

import com.example.festival.member.entity.Member;
import com.example.festival.usedtrade.entity.UsedTransaction;

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
 * trade_chat_room 매핑. 중고거래 구매요청(UsedTransaction) 하나당 채팅방 하나(1:1, buyer-seller).
 */
@Entity
@Table(name = "trade_chat_room")
@Getter
@NoArgsConstructor
public class TradeChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false, unique = true)
    private UsedTransaction transaction;

    @Column(name = "blocked", nullable = false)
    private boolean blocked;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blocked_by")
    private Member blockedBy;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public TradeChatRoom(UsedTransaction transaction) {
        this.transaction = transaction;
    }

    public void block(Member by) {
        this.blocked = true;
        this.blockedBy = by;
    }

    public void unblock() {
        this.blocked = false;
        this.blockedBy = null;
    }
}
