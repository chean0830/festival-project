package com.example.festival.artist.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 읽기 전용 최소 매핑. 아티스트 마스터 데이터 관리는 프로필 담당 범위가 아니며,
 * 관심 가수 목록 조회 시 이름/이미지를 함께 보여주기 위해서만 사용한다.
 */
@Entity
@Table(name = "artist")
@Getter
@NoArgsConstructor
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "artist_id")
    private Long artistId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "artist_type", length = 20)
    private String artistType;

    @Column(name = "profile_image", length = 500)
    private String profileImage;
}
