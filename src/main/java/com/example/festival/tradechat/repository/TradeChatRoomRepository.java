package com.example.festival.tradechat.repository;

import com.example.festival.tradechat.entity.TradeChatRoom;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TradeChatRoomRepository extends JpaRepository<TradeChatRoom, Long> {

    @Query("SELECT r FROM TradeChatRoom r "
            + "JOIN FETCH r.transaction t JOIN FETCH t.listing l JOIN FETCH l.seller JOIN FETCH t.buyer "
            + "WHERE t.transactionId = :transactionId")
    Optional<TradeChatRoom> findByTransactionIdWithDetails(@Param("transactionId") Long transactionId);

    @Query("SELECT r FROM TradeChatRoom r "
            + "JOIN FETCH r.transaction t JOIN FETCH t.listing l JOIN FETCH l.seller JOIN FETCH t.buyer "
            + "WHERE r.roomId = :roomId")
    Optional<TradeChatRoom> findByIdWithDetails(@Param("roomId") Long roomId);
}
