package com.example.festival.youtube.repository;

import com.example.festival.youtube.entity.YouTubeConnection;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface YouTubeConnectionRepository extends JpaRepository<YouTubeConnection, Long> {

    Optional<YouTubeConnection> findByMember_Id(Long memberId);
}
