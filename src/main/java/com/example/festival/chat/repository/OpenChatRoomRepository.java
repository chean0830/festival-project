package com.example.festival.chat.repository;

import com.example.festival.chat.entity.OpenChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OpenChatRoomRepository extends JpaRepository<OpenChatRoom, Long> {

    Optional<OpenChatRoom> findByEvent_EventId(Long eventId);
}
