package com.example.festival.mdshop.entity;

import com.example.festival.event.entity.Event;
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
 * md_product 매핑 (MD 상품 / 사전예약).
 */
@Entity
@Table(name = "md_product")
@Getter
@NoArgsConstructor
public class MdProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "category", length = 50)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false, precision = 10, scale = 0)
    private BigDecimal price;

    @Column(name = "stock", nullable = false)
    private int stock;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    // PREORDER, ON_SALE, SOLD_OUT
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "preorder_deadline")
    private LocalDateTime preorderDeadline;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public void decreaseStock(int amount) {
        this.stock -= amount;
    }

    public void increaseStock(int amount) {
        this.stock += amount;
    }

    public void changeStatus(String status) {
        this.status = status;
    }
}
