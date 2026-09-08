package com.example.festival.live.admission.entity;

import com.example.festival.live.entity.LiveStream;
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
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(
        name = "live_payment",
        uniqueConstraints = @UniqueConstraint(columnNames = {"stream_id", "member_id"})
)
@Getter
@NoArgsConstructor
public class LiveAdmissionPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stream_id", nullable = false)
    private LiveStream stream;

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

    public LiveAdmissionPayment(
            LiveStream stream,
            Member member,
            String tossOrderId,
            String paymentKey,
            String paymentMethod,
            BigDecimal amount,
            LocalDateTime paidAt
    ) {
        this.stream = stream;
        this.member = member;
        this.tossOrderId = tossOrderId;
        this.paymentKey = paymentKey;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.status = "SUCCESS";
        this.paidAt = paidAt;
    }
}
