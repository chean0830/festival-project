package com.example.festival.home.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * home_banner 매핑. 홈 화면 큰 배너 이미지를 DB로 관리한다 —
 * 이미지 자체는 uploads/banner/ 아래 파일로 두고, 여기엔 그 경로(URL)만 저장한다.
 * 배너를 바꿀 땐 파일 교체 + image_url UPDATE만 하면 프론트/백엔드 재배포 없이 바로 반영된다.
 */
@Entity
@Table(name = "home_banner")
@Getter
@NoArgsConstructor
public class HomeBanner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "banner_id")
    private Long bannerId;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;
}
