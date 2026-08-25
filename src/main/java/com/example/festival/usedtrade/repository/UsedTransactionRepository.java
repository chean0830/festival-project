package com.example.festival.usedtrade.repository;

import com.example.festival.usedtrade.entity.UsedTransaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UsedTransactionRepository extends JpaRepository<UsedTransaction, Long> {

    @Query("SELECT t FROM UsedTransaction t "
            + "JOIN FETCH t.listing l JOIN FETCH l.seller "
            + "WHERE t.buyer.id = :memberId "
            + "ORDER BY t.createdAt DESC")
    List<UsedTransaction> findAllByBuyerIdWithListing(@Param("memberId") Long memberId);

    @Query("SELECT t FROM UsedTransaction t "
            + "JOIN FETCH t.listing l JOIN FETCH t.buyer "
            + "WHERE l.seller.id = :memberId "
            + "ORDER BY t.createdAt DESC")
    List<UsedTransaction> findAllBySellerIdWithListing(@Param("memberId") Long memberId);

    List<UsedTransaction> findAllByListing_ListingIdAndStatus(Long listingId, String status);
}
