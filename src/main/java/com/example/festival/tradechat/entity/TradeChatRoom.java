package com.example.festival.tradechat.entity;

import com.example.festival.member.entity.Member;
import com.example.festival.usedtrade.entity.UsedListing;
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
 * trade_chat_room 매핑. 매물(listing) + 구매자(buyer) 한 쌍당 채팅방 하나(1:1) — 상대는 매물의 판매자.
 * 구매요청(UsedTransaction)은 선택 항목이다: 채팅 중 실제 구매 요청이 생기면 그 방에 연결된다.
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
    @JoinColumn(name = "listing_id", nullable = false)
    private UsedListing listing;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private Member buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private UsedTransaction transaction;

    @Column(name = "blocked", nullable = false)
    private boolean blocked;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blocked_by")
    private Member blockedBy;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public TradeChatRoom(UsedListing listing, Member buyer) {
        this.listing = listing;
        this.buyer = buyer;
    }

    public void linkTransaction(UsedTransaction transaction) {
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
