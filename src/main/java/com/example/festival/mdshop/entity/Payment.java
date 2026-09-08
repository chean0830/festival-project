package com.example.festival.mdshop.entity;

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
 * payment 매핑 (MD 사전예약 주문의 Toss Payments 결제 기록).
 */
@Entity
@Table(name = "payment")
@Getter
@NoArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private MdOrder order;

    @Column(name = "toss_order_id", nullable = false, unique = true, length = 64)
    private String tossOrderId;

    @Column(name = "payment_key", nullable = false, unique = true, length = 100)
    private String paymentKey;

    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod;

    @Column(name = "amount", nullable = false, precision = 10, scale = 0)
    private BigDecimal amount;

    // SUCCESS, FAIL, CANCELED
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Payment(
            MdOrder order,
            String tossOrderId,
            String paymentKey,
            String paymentMethod,
            BigDecimal amount,
            String status,
            LocalDateTime paidAt
    ) {
        this.order = order;
        this.tossOrderId = tossOrderId;
        this.paymentKey = paymentKey;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.status = status;
        this.paidAt = paidAt;
    }

    public void markCanceled() {
        this.status = "CANCELED";
    }
}
