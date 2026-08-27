package com.example.festival.live.donation.service;

import com.example.festival.live.donation.dto.DonationCreateRequest;
import com.example.festival.live.donation.dto.DonationResponse;
import com.example.festival.live.donation.entity.Donation;
import com.example.festival.live.donation.entity.DonationPayment;
import com.example.festival.live.donation.repository.DonationPaymentRepository;
import com.example.festival.live.donation.repository.DonationRepository;
import com.example.festival.live.entity.LiveStream;
import com.example.festival.live.entity.LiveStreamStatus;
import com.example.festival.live.repository.LiveStreamRepository;
import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import com.example.festival.payment.TossPaymentClient;
import com.example.festival.payment.dto.PaymentConfirmRequest;
import com.example.festival.payment.dto.TossConfirmResponse;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DonationService {

    private final DonationRepository donationRepository;
    private final DonationPaymentRepository donationPaymentRepository;
    private final LiveStreamRepository liveStreamRepository;
    private final MemberRepository memberRepository;
    private final TossPaymentClient tossPaymentClient;

    public DonationService(
            DonationRepository donationRepository,
            DonationPaymentRepository donationPaymentRepository,
            LiveStreamRepository liveStreamRepository,
            MemberRepository memberRepository,
            TossPaymentClient tossPaymentClient
    ) {
        this.donationRepository = donationRepository;
        this.donationPaymentRepository = donationPaymentRepository;
        this.liveStreamRepository = liveStreamRepository;
        this.memberRepository = memberRepository;
        this.tossPaymentClient = tossPaymentClient;
    }

    @Transactional
    public DonationResponse create(Long streamId, Long donorId, DonationCreateRequest request) {
        LiveStream stream = liveStreamRepository.findById(streamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "방송을 찾을 수 없습니다."));
        if (stream.getStatus() != LiveStreamStatus.LIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "진행 중인 방송에만 후원할 수 있습니다.");
        }
        if (stream.isOwnedBy(donorId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "자신의 방송에는 후원할 수 없습니다.");
        }

        Member donor = memberRepository.findById(donorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 정보를 찾을 수 없습니다."));
        Donation donation = Donation.create(
                stream,
                donor,
                request.amount(),
                normalize(request.message())
        );
        return toResponse(donationRepository.save(donation));
    }

    @Transactional
    public DonationResponse confirm(Long donationId, Long donorId, PaymentConfirmRequest request) {
        Donation donation = donationRepository.findByDonationIdAndDonor_Id(donationId, donorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "후원 정보를 찾을 수 없습니다."));
        if (!"PENDING".equals(donation.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 처리된 후원입니다.");
        }
        if (donationPaymentRepository.existsByDonation_DonationId(donationId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 결제된 후원입니다.");
        }
        if (donation.getAmount().compareTo(request.amount()) != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "결제 금액이 후원 금액과 일치하지 않습니다.");
        }
        if (!request.orderId().startsWith("DONATION_" + donationId + "_")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "후원 주문번호가 올바르지 않습니다.");
        }

        TossConfirmResponse confirmed = tossPaymentClient.confirm(
                request.paymentKey(),
                request.orderId(),
                request.amount()
        );
        donationPaymentRepository.save(new DonationPayment(
                donation,
                request.orderId(),
                request.paymentKey(),
                confirmed.method(),
                request.amount(),
                LocalDateTime.now()
        ));
        donation.markSuccess();
        return toResponse(donation);
    }

    private DonationResponse toResponse(Donation donation) {
        return new DonationResponse(
                donation.getDonationId(),
                donation.getStream().getId(),
                donation.getStream().getTitle(),
                donation.getDonor().getNickname(),
                donation.getAmount(),
                donation.getMessage(),
                donation.getStatus(),
                donation.getCreatedAt()
        );
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
