package com.example.festival.mdshop.repository;

import com.example.festival.mdshop.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrder_OrderIdAndStatus(Long orderId, String status);
}
