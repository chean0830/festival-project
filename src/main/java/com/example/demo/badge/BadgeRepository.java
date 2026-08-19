package com.example.demo.badge;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {

    List<Badge> findAllByOrderByBadgeIdAsc();
}
