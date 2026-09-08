package com.example.festival.mdshop.repository;

import com.example.festival.mdshop.entity.MdProduct;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MdProductRepository extends JpaRepository<MdProduct, Long> {

    @Query("SELECT p FROM MdProduct p JOIN FETCH p.event WHERE p.status IN (:statuses) ORDER BY p.preorderDeadline ASC")
    List<MdProduct> findAllByStatusInWithEvent(@Param("statuses") List<String> statuses);

    @Query("SELECT p FROM MdProduct p JOIN FETCH p.event "
            + "WHERE p.event.eventId = :eventId AND p.status IN (:statuses) "
            + "ORDER BY p.preorderDeadline ASC")
    List<MdProduct> findAllByEventIdAndStatusInWithEvent(
            @Param("eventId") Long eventId,
            @Param("statuses") List<String> statuses
    );
}
