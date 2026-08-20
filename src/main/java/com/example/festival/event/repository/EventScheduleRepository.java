package com.example.festival.event.repository;

import com.example.festival.event.entity.EventSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventScheduleRepository extends JpaRepository<EventSchedule, Long> {

    List<EventSchedule> findByEvent_EventIdOrderByLineupOrderAsc(Long eventId);
}
