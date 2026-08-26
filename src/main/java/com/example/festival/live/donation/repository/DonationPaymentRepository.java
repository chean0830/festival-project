package com.example.festival.live.donation.repository;

import com.example.festival.live.donation.entity.DonationPayment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonationPaymentRepository extends JpaRepository<DonationPayment, Long> {
    boolean existsByDonation_DonationId(Long donationId);
}
