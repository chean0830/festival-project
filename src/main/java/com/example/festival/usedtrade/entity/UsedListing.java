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
 * used_listing 매핑 (MD 중고거래 매물).
 * 아티스트/공연 테이블과 정식으로 연결하지 않고, tags(해시태그)로 검색만 지원한다.
 */
@Entity
@Table(name = "used_listing")
@Getter
@NoArgsConstructor
public class UsedListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "listing_id")
    private Long listingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Member seller;

    // CLOTHING, ALBUM, FASHION_GOODS, POSTER_PRINT, CHARACTER_GOODS, LIVING_GOODS, ACCESSORY, SLOGAN_TOWEL
    @Column(name = "category", nullable = false, length = 20)
    private String category;

    // 해시태그 검색용 (예: "#넬 #페스티벌후드티")
    @Column(name = "tags", length = 300)
    private String tags;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false, precision = 10, scale = 0)
    private BigDecimal price;

    // MySQL 예약어라 백틱으로 감싸지 않으면 INSERT/UPDATE 시 SQL 문법 오류가 난다.
    @Column(name = "`condition`", length = 20)
    private String condition;

    @Column(name = "trade_method", length = 20)
    private String tradeMethod;

    @Column(name = "region", length = 100)
    private String region;

    // 업로드된 이미지 URL을 ","로 이어붙여 저장 (최소 2장). 실제 분리/조립은 서비스 계층에서 처리한다.
    @Column(name = "image_url", length = 2000)
    private String imageUrl;

    // ON_SALE, RESERVED, SOLD, CANCELED
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public UsedListing(
            Member seller,
            String category,
            String tags,
            String title,
            String description,
            BigDecimal price,
            String condition,
            String tradeMethod,
            String region,
            String imageUrl,
            String status
    ) {
        this.seller = seller;
        this.category = category;
        this.tags = tags;
        this.title = title;
        this.description = description;
        this.price = price;
        this.condition = condition;
        this.tradeMethod = tradeMethod;
        this.region = region;
        this.imageUrl = imageUrl;
        this.status = status;
    }

    public void changeStatus(String status) {
        this.status = status;
    }

    public void updateDetails(
            String category,
            String tags,
            String title,
            String description,
            BigDecimal price,
            String condition,
            String tradeMethod,
            String region,
            String imageUrl
    ) {
        this.category = category;
        this.tags = tags;
        this.title = title;
        this.description = description;
        this.price = price;
        this.condition = condition;
        this.tradeMethod = tradeMethod;
        this.region = region;
        this.imageUrl = imageUrl;
    }
}
