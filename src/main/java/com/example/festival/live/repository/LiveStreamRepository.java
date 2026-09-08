package com.example.festival.live.repository;

import com.example.festival.live.entity.LiveStream;
import com.example.festival.live.entity.LiveStreamStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LiveStreamRepository extends JpaRepository<LiveStream, Long> {

    @EntityGraph(attributePaths = {"host", "event"})
    List<LiveStream> findAllByStatusOrderByStartAtDesc(LiveStreamStatus status);

    @EntityGraph(attributePaths = {"host", "event"})
    List<LiveStream> findAllByHost_IdOrderByCreatedAtDesc(Long hostId);

    @EntityGraph(attributePaths = {"host", "event"})
    List<LiveStream> findAllByHost_IdAndStatus(Long hostId, LiveStreamStatus status);

    @Override
    @EntityGraph(attributePaths = {"host", "event"})
    Optional<LiveStream> findById(Long id);
}
