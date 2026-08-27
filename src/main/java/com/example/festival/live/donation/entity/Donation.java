package com.example.festival.live.donation.entity;

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
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "donation")
@Getter
@NoArgsConstructor
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "donation_id")
    private Long donationId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "stream_id", nullable = false)
    private LiveStream stream;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "donor_id", nullable = false)
    private Member donor;

    @Column(nullable = false, precision = 10, scale = 0)
    private BigDecimal amount;

    @Column(length = 200)
    private String message;

    @Column(nullable = false, length = 20)
    private String status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private Donation(LiveStream stream, Member donor, BigDecimal amount, String message) {
        this.stream = stream;
        this.donor = donor;
        this.amount = amount;
        this.message = message;
        this.status = "PENDING";
    }

    public static Donation create(LiveStream stream, Member donor, BigDecimal amount, String message) {
        return new Donation(stream, donor, amount, message);
    }

    public void markSuccess() {
        this.status = "SUCCESS";
    }
}
