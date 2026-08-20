package com.example.demo.venue;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 읽기 전용 최소 매핑. 공연장 관리는 프로필 담당 범위가 아니며,
 * "나의 뱃지"에서 국내/해외 공연 여부를 판별하기 위해서만 사용한다.
 */
@Entity
@Table(name = "venue")
@Getter
@NoArgsConstructor
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "venue_id")
    private Long venueId;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "country", nullable = false, length = 2)
    private String country;
}
