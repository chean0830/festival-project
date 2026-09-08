package com.example.festival.live.donation.repository;

import com.example.festival.live.donation.entity.Donation;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationRepository extends JpaRepository<Donation, Long> {

    @EntityGraph(attributePaths = {"stream", "donor"})
    Optional<Donation> findByDonationIdAndDonor_Id(Long donationId, Long donorId);
}
