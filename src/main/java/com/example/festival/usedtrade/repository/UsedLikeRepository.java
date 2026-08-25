package com.example.festival.usedtrade.repository;

import com.example.festival.usedtrade.entity.UsedLike;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsedLikeRepository extends JpaRepository<UsedLike, Long> {

    Optional<UsedLike> findByListing_ListingIdAndMember_Id(Long listingId, Long memberId);

    long countByListing_ListingId(Long listingId);

    long deleteByListing_ListingIdAndMember_Id(Long listingId, Long memberId);

    @Query("SELECT ul FROM UsedLike ul "
            + "JOIN FETCH ul.listing l "
            + "JOIN FETCH l.seller "
            + "WHERE ul.member.id = :memberId "
            + "ORDER BY ul.createdAt DESC")
    List<UsedLike> findAllByMemberIdWithListing(@Param("memberId") Long memberId);
}
