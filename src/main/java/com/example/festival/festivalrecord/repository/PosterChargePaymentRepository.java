package com.example.festival.festivalrecord.repository;

import com.example.festival.festivalrecord.entity.PosterChargePayment;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PosterChargePaymentRepository extends JpaRepository<PosterChargePayment, Long> {

    Optional<PosterChargePayment> findByTossOrderId(String tossOrderId);
}
