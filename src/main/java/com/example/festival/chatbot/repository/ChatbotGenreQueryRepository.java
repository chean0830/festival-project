package com.example.festival.chatbot.repository;

import com.example.festival.genre.entity.Genre;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * 챗봇 전용 조회 리포지토리: 관심 등록한 아티스트들의 장르를 알아내기 위한 native 조인.
 * artist_genre 조인 테이블은 genre 도메인에도 대응 메서드가 없어서(event_genre 쪽만 있음) 새로 추가한다.
 */
public interface ChatbotGenreQueryRepository extends JpaRepository<Genre, Long> {

    @Query(value = "SELECT ag.artist_id AS artistId, g.name AS genreName "
            + "FROM artist_genre ag JOIN genre g ON g.genre_id = ag.genre_id "
            + "WHERE ag.artist_id IN (:artistIds)", nativeQuery = true)
    List<ArtistGenreRow> findGenreNamesForArtistIds(@Param("artistIds") List<Long> artistIds);

    interface ArtistGenreRow {
        Long getArtistId();
        String getGenreName();
    }
}
