package com.example.festival.chat.repository;

import com.example.festival.chat.entity.OpenChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OpenChatMessageRepository extends JpaRepository<OpenChatMessage, Long> {

    @Query("SELECT ocm FROM OpenChatMessage ocm JOIN FETCH ocm.member "
            + "WHERE ocm.room.roomId = :roomId AND ocm.deleted = false "
            + "ORDER BY ocm.createdAt DESC, ocm.messageId DESC")
    List<OpenChatMessage> findRecentByRoomId(@Param("roomId") Long roomId, Pageable pageable);
}
