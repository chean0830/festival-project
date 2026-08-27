package com.example.festival.live.admission.repository;

import com.example.festival.live.admission.entity.LiveAdmissionPayment;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LiveAdmissionPaymentRepository extends JpaRepository<LiveAdmissionPayment, Long> {

    boolean existsByStream_IdAndMember_IdAndStatus(Long streamId, Long memberId, String status);

    @EntityGraph(attributePaths = {"stream", "member"})
    Optional<LiveAdmissionPayment> findByStream_IdAndMember_IdAndStatus(
            Long streamId,
            Long memberId,
            String status
    );
}
