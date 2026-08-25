package com.example.festival.usedtrade.repository;

import com.example.festival.usedtrade.entity.UsedTransactionPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsedTransactionPaymentRepository extends JpaRepository<UsedTransactionPayment, Long> {

    Optional<UsedTransactionPayment> findByTransaction_TransactionIdAndStatus(Long transactionId, String status);
}
