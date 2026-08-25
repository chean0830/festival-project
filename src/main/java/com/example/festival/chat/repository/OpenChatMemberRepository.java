package com.example.festival.chat.repository;

import com.example.festival.chat.entity.OpenChatMember;
import com.example.festival.chat.entity.OpenChatMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OpenChatMemberRepository extends JpaRepository<OpenChatMember, OpenChatMemberId> {

    Optional<OpenChatMember> findByRoom_RoomIdAndMember_Id(Long roomId, Long memberId);

    long countByRoom_RoomIdAndLeftAtIsNull(Long roomId);
}
