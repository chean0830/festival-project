package com.example.festival.interest.repository;

import com.example.festival.interest.entity.MemberArtist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MemberArtistRepository extends JpaRepository<MemberArtist, Long> {

    @Query("SELECT ma FROM MemberArtist ma JOIN FETCH ma.artist WHERE ma.member.id = :memberId ORDER BY ma.createdAt DESC")
    List<MemberArtist> findAllByMemberIdWithArtist(@Param("memberId") Long memberId);

    Optional<MemberArtist> findByMember_IdAndArtist_ArtistId(Long memberId, Long artistId);

    // 이 아티스트를 관심 등록한 회원들 (신상 MD 알림 발송용)
    List<MemberArtist> findAllByArtist_ArtistId(Long artistId);

    long deleteByMember_IdAndArtist_ArtistId(Long memberId, Long artistId);

    /**
     * 관심 등록한 아티스트가 출연하는 공연 중 시작일이 임박(deadline 이내)한 것들.
     * UpcomingArtistEventReminderScheduler가 알림 발송할 때 사용한다.
     */
    @Query("SELECT DISTINCT ma.member.id AS memberId, es.event.eventId AS eventId, ma.artist.name AS artistName "
            + "FROM MemberArtist ma JOIN EventSchedule es ON es.artist.artistId = ma.artist.artistId "
            + "WHERE es.event.startDate >= CURRENT_DATE AND es.event.startDate <= :deadline")
    List<ArtistUpcomingEventRow> findUpcomingEventsForInterestedArtists(@Param("deadline") LocalDate deadline);

    interface ArtistUpcomingEventRow {
        Long getMemberId();
        Long getEventId();
        String getArtistName();
    }
}
