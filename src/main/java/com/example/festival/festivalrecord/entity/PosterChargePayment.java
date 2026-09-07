package com.example.festival.festivalrecord.entity;

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
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

/**
 * AI 포스터 "다시 만들기" 무료 3회를 모두 쓴 뒤 1회당 900원에 생성 횟수를 충전한 결제 내역.
 * 결제가 승인되면 festival_record_ai_quota.poster_paid_count 가 1 늘어나 한 번 더 생성할 수 있게 된다.
 */
@Entity
@Table(name = "poster_charge_payment")
@Getter
@NoArgsConstructor
public class PosterChargePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "charge_id")
    private Long chargeId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "record_id", nullable = false)
    private FestivalRecord record;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "toss_order_id", nullable = false, unique = true, length = 64)
    private String tossOrderId;

    @Column(name = "payment_key", nullable = false, unique = true, length = 100)
    private String paymentKey;

    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod;

    @Column(nullable = false, precision = 10, scale = 0)
    private BigDecimal amount;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public PosterChargePayment(
            FestivalRecord record,
            Member member,
            String tossOrderId,
            String paymentKey,
            String paymentMethod,
            BigDecimal amount,
            LocalDateTime paidAt
    ) {
        this.record = record;
        this.member = member;
        this.tossOrderId = tossOrderId;
        this.paymentKey = paymentKey;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.status = "SUCCESS";
        this.paidAt = paidAt;
    }
}
