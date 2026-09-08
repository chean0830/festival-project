package com.example.festival.venue.repository;

import com.example.festival.venue.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VenueRepository extends JpaRepository<Venue, Long> {

    List<Venue> findByLatitudeIsNullAndAddressIsNotNull();
}
