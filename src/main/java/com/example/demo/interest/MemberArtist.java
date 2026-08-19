package com.example.demo.interest;

import com.example.demo.artist.Artist;
import com.example.demo.member.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * member_artist 매핑 (관심 가수).
 * 메인 페이지에서 하트를 누르면 이 테이블에 row가 생성/삭제되는 구조를 전제로 한다.
 * 이 엔티티/Repository는 프로필(조회)과 메인 페이지(등록/삭제) 담당자가 함께 사용하는 공용 데이터 구조다.
 * 프로필 담당 범위에서는 조회만 구현하며, 등록/삭제 API는 만들지 않는다.
 */
@Entity
@Table(name = "member_artist")
@Getter
@NoArgsConstructor
public class MemberArtist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_artist_id")
    private Long memberArtistId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artist_id", nullable = false)
    private Artist artist;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
