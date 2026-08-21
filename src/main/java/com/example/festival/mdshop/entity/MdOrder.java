package com.example.festival.mdshop.entity;

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
 * md_order 매핑 (MD 사전예약/주문).
 * 실제 결제(PG) 연동 전이라, 생성 시 status는 항상 PAYMENT_WAIT으로 시작한다.
 */
@Entity
@Table(name = "md_order")
@Getter
@NoArgsConstructor
public class MdOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private MdProduct product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 0)
    private BigDecimal totalPrice;

    @Column(name = "shipping_name", nullable = false, length = 50)
    private String shippingName;

    @Column(name = "shipping_address", nullable = false, length = 300)
    private String shippingAddress;

    @Column(name = "shipping_phone", nullable = false, length = 20)
    private String shippingPhone;

    // PAYMENT_WAIT, PAID, SHIPPED, COMPLETED, CANCELED
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public MdOrder(
            MdProduct product,
            Member member,
            String orderNumber,
            int quantity,
            BigDecimal totalPrice,
            String shippingName,
            String shippingAddress,
            String shippingPhone,
            String status
    ) {
        this.product = product;
        this.member = member;
        this.orderNumber = orderNumber;
        this.quantity = quantity;
        this.totalPrice = totalPrice;
        this.shippingName = shippingName;
        this.shippingAddress = shippingAddress;
        this.shippingPhone = shippingPhone;
        this.status = status;
    }

    public void changeStatus(String status) {
        this.status = status;
    }
}
