package com.example.festival.badge.repository;

import com.example.festival.badge.entity.Badge;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {

    List<Badge> findAllByOrderByBadgeIdAsc();
}
