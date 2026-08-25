package com.example.festival.home.repository;

import com.example.festival.home.entity.HomeBanner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HomeBannerRepository extends JpaRepository<HomeBanner, Long> {

    Optional<HomeBanner> findFirstByOrderByBannerIdDesc();
}
