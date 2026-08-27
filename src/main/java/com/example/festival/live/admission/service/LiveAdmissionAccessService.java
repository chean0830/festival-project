package com.example.festival.live.admission.service;

import com.example.festival.live.admission.repository.LiveAdmissionPaymentRepository;
import com.example.festival.live.entity.LiveStream;
import com.example.festival.member.entity.MemberRole;
import com.example.festival.member.repository.MemberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class LiveAdmissionAccessService {

    private static final String SUCCESS = "SUCCESS";

    private final LiveAdmissionPaymentRepository paymentRepository;
    private final MemberRepository memberRepository;

    public LiveAdmissionAccessService(
            LiveAdmissionPaymentRepository paymentRepository,
            MemberRepository memberRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.memberRepository = memberRepository;
    }

    public boolean isAdmissionRequired(LiveStream stream, Long memberId) {
        if (!stream.isPaid() || stream.isOwnedBy(memberId)) return false;
        if (memberId == null) return true;
        if (memberRepository.findById(memberId)
                .map(member -> member.getRole() == MemberRole.ADMIN)
                .orElse(false)) {
            return false;
        }
        return !paymentRepository.existsByStream_IdAndMember_IdAndStatus(
                stream.getId(),
                memberId,
                SUCCESS
        );
    }

    public void requireAdmission(LiveStream stream, Long memberId) {
        if (!isAdmissionRequired(stream, memberId)) return;
        if (memberId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유료 방송은 로그인 후 입장할 수 있습니다.");
        }
        throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "방송 입장권 결제가 필요합니다.");
    }
}
