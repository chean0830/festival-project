package com.example.festival.interest.repository;

import com.example.festival.interest.entity.MemberArtist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MemberArtistRepository extends JpaRepository<MemberArtist, Long> {

    @Query("SELECT ma FROM MemberArtist ma JOIN FETCH ma.artist WHERE ma.member.id = :memberId ORDER BY ma.createdAt DESC")
    List<MemberArtist> findAllByMemberIdWithArtist(@Param("memberId") Long memberId);

    Optional<MemberArtist> findByMember_IdAndArtist_ArtistId(Long memberId, Long artistId);

    // 이 아티스트를 관심 등록한 회원들 (신상 MD 알림 발송용)
    List<MemberArtist> findAllByArtist_ArtistId(Long artistId);

    long deleteByMember_IdAndArtist_ArtistId(Long memberId, Long artistId);
}
