package com.example.festival.chat.repository;

import com.example.festival.chat.entity.OpenChatMember;
import com.example.festival.chat.entity.OpenChatMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OpenChatMemberRepository extends JpaRepository<OpenChatMember, OpenChatMemberId> {

    Optional<OpenChatMember> findByRoom_RoomIdAndMember_Id(Long roomId, Long memberId);

    long countByRoom_RoomIdAndLeftAtIsNull(Long roomId);

    @Query("SELECT om FROM OpenChatMember om JOIN FETCH om.room r JOIN FETCH r.event "
            + "WHERE om.member.id = :memberId AND om.leftAt IS NULL")
    List<OpenChatMember> findActiveByMemberIdWithDetails(@Param("memberId") Long memberId);
}
