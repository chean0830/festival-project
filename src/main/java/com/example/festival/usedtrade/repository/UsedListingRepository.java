package com.example.festival.usedtrade.repository;

import com.example.festival.usedtrade.entity.UsedListing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface UsedListingRepository extends JpaRepository<UsedListing, Long> {

    @Query("SELECT l FROM UsedListing l "
            + "JOIN FETCH l.seller "
            + "WHERE l.status <> 'CANCELED' "
            + "AND (:category IS NULL OR l.category = :category) "
            + "AND (:tag IS NULL OR l.tags LIKE CONCAT('%', :tag, '%')) "
            + "AND (:keyword IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "     OR LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) "
            + "AND (:minPrice IS NULL OR l.price >= :minPrice) "
            + "AND (:maxPrice IS NULL OR l.price <= :maxPrice) "
            + "AND (:onSaleOnly = false OR l.status = 'ON_SALE') "
            + "AND (:sellerId IS NULL OR l.seller.id = :sellerId) "
            + "ORDER BY l.createdAt DESC")
    List<UsedListing> findAllWithFilters(
            @Param("category") String category,
            @Param("tag") String tag,
            @Param("keyword") String keyword,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("onSaleOnly") boolean onSaleOnly,
            @Param("sellerId") Long sellerId
    );

    @Query("SELECT l FROM UsedListing l "
            + "JOIN FETCH l.seller "
            + "WHERE l.seller.id = :memberId "
            + "ORDER BY l.createdAt DESC")
    List<UsedListing> findAllBySellerIdWithDetails(@Param("memberId") Long memberId);
}
