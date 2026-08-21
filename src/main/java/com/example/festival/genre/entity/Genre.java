package com.example.festival.genre.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * genre 테이블 매핑. artist_genre/event_genre로 아티스트/공연과 다대다 연결된다.
 * (조인 테이블 자체는 별도 엔티티 없이 GenreRepository의 네이티브 쿼리로 조회)
 */
@Entity
@Table(name = "genre")
@Getter
@NoArgsConstructor
public class Genre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "genre_id")
    private Long genreId;

    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;
}
