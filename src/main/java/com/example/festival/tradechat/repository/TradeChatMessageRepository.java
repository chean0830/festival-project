package com.example.festival.tradechat.repository;

import com.example.festival.tradechat.entity.TradeChatMessage;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TradeChatMessageRepository extends JpaRepository<TradeChatMessage, Long> {

    @Query("SELECT m FROM TradeChatMessage m JOIN FETCH m.sender "
            + "WHERE m.room.roomId = :roomId ORDER BY m.createdAt DESC, m.messageId DESC")
    List<TradeChatMessage> findRecentByRoomId(@Param("roomId") Long roomId, Pageable pageable);

    List<TradeChatMessage> findByRoom_RoomIdAndSender_IdNotAndReadFalse(Long roomId, Long memberId);

    long countByRoom_RoomIdAndSender_IdNotAndReadFalse(Long roomId, Long memberId);

    /**
     * 오프라인일 때 "마지막 접속" 근사치로 쓴다 — 이 회원이 이 방에서 마지막으로 보낸 메시지 시각.
     * 실제 "마지막 앱 접속 시각"은 아니지만 별도 프레즌스 테이블 없이 얻을 수 있는 가장 가까운 값이다.
     */
    @Query("SELECT MAX(m.createdAt) FROM TradeChatMessage m WHERE m.room.roomId = :roomId AND m.sender.id = :memberId")
    LocalDateTime findLastMessageTimeBySender(@Param("roomId") Long roomId, @Param("memberId") Long memberId);

    @Query("SELECT r.transaction.transactionId AS transactionId, COUNT(m) AS count "
            + "FROM TradeChatMessage m JOIN m.room r "
            + "WHERE m.read = false AND m.sender.id <> :memberId "
            + "AND (r.transaction.buyer.id = :memberId OR r.transaction.listing.seller.id = :memberId) "
            + "GROUP BY r.transaction.transactionId")
    List<UnreadCountRow> countUnreadByMember(@Param("memberId") Long memberId);

    interface UnreadCountRow {
        Long getTransactionId();
        long getCount();
    }
}
