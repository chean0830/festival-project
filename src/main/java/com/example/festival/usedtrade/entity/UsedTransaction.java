package com.example.festival.usedtrade.entity;

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

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * used_transaction 매핑 (중고 매물 구매 요청/거래).
 */
@Entity
@Table(name = "used_transaction")
@Getter
@NoArgsConstructor
public class UsedTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private UsedListing listing;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private Member buyer;

    @Column(name = "price", nullable = false, precision = 10, scale = 0)
    private BigDecimal price;

    // REQUEST, APPROVED, PAID, COMPLETED, CANCELED
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public UsedTransaction(UsedListing listing, Member buyer, BigDecimal price, String status) {
        this.listing = listing;
        this.buyer = buyer;
        this.price = price;
        this.status = status;
    }

    public void changeStatus(String status) {
        this.status = status;
    }

    public void markCompleted(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
