package com.example.festival.tradechat.repository;

import com.example.festival.tradechat.entity.TradeChatRoom;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TradeChatRoomRepository extends JpaRepository<TradeChatRoom, Long> {

    @Query("SELECT r FROM TradeChatRoom r "
            + "JOIN FETCH r.listing l JOIN FETCH l.seller JOIN FETCH r.buyer "
            + "LEFT JOIN FETCH r.transaction "
            + "WHERE r.listing.listingId = :listingId AND r.buyer.id = :buyerId")
    Optional<TradeChatRoom> findByListingIdAndBuyerIdWithDetails(
            @Param("listingId") Long listingId, @Param("buyerId") Long buyerId);

    @Query("SELECT r FROM TradeChatRoom r "
            + "JOIN FETCH r.listing l JOIN FETCH l.seller JOIN FETCH r.buyer "
            + "LEFT JOIN FETCH r.transaction "
            + "WHERE r.roomId = :roomId")
    Optional<TradeChatRoom> findByIdWithDetails(@Param("roomId") Long roomId);

    @Query("SELECT r FROM TradeChatRoom r "
            + "JOIN FETCH r.listing l JOIN FETCH l.seller JOIN FETCH r.buyer "
            + "LEFT JOIN FETCH r.transaction "
            + "WHERE r.buyer.id = :memberId OR r.listing.seller.id = :memberId")
    List<TradeChatRoom> findAllByMemberWithDetails(@Param("memberId") Long memberId);
}
