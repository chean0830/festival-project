package com.example.demo.interest;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MemberArtistRepository extends JpaRepository<MemberArtist, Long> {

    @Query("SELECT ma FROM MemberArtist ma JOIN FETCH ma.artist WHERE ma.member.id = :memberId ORDER BY ma.createdAt DESC")
    List<MemberArtist> findAllByMemberIdWithArtist(@Param("memberId") Long memberId);
}
