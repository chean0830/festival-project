package com.example.festival.badge.repository;

import com.example.festival.badge.entity.MemberBadge;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MemberBadgeRepository extends JpaRepository<MemberBadge, Long> {

    @Query("SELECT mb FROM MemberBadge mb WHERE mb.member.id = :memberId")
    List<MemberBadge> findAllByMemberId(@Param("memberId") Long memberId);
}
