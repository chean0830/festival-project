package com.example.festival.home.controller;

import com.example.festival.home.dto.HomeBannerDto;
import com.example.festival.home.entity.HomeBanner;
import com.example.festival.home.repository.HomeBannerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 홈 화면 큰 배너 이미지 조회. 배너 교체는 DB(home_banner.image_url)만 바꾸면 되고
 * 코드 배포가 필요 없다 — uploads/banner/ 에 새 파일을 넣고 그 경로로 UPDATE하면 된다.
 */
@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeBannerController {

    private final HomeBannerRepository homeBannerRepository;

    @GetMapping("/banner")
    public HomeBannerDto getBanner() {
        return homeBannerRepository.findFirstByOrderByBannerIdDesc()
                .map(HomeBanner::getImageUrl)
                .map(HomeBannerDto::new)
                .orElse(null);
    }
}
