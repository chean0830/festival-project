package com.example.festival.live.admission.service;

import com.example.festival.live.admission.dto.LiveAdmissionResponse;
import com.example.festival.live.admission.entity.LiveAdmissionPayment;
import com.example.festival.live.admission.repository.LiveAdmissionPaymentRepository;
import com.example.festival.live.entity.LiveStream;
import com.example.festival.live.entity.LiveStreamStatus;
import com.example.festival.live.repository.LiveStreamRepository;
import com.example.festival.member.entity.Member;
import com.example.festival.member.entity.MemberRole;
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
@Transactional(readOnly = true)
public class LiveAdmissionPaymentService {

    private static final String SUCCESS = "SUCCESS";

    private final LiveAdmissionPaymentRepository paymentRepository;
    private final LiveStreamRepository liveStreamRepository;
    private final MemberRepository memberRepository;
    private final TossPaymentClient tossPaymentClient;

    public LiveAdmissionPaymentService(
            LiveAdmissionPaymentRepository paymentRepository,
            LiveStreamRepository liveStreamRepository,
            MemberRepository memberRepository,
            TossPaymentClient tossPaymentClient
    ) {
        this.paymentRepository = paymentRepository;
        this.liveStreamRepository = liveStreamRepository;
        this.memberRepository = memberRepository;
        this.tossPaymentClient = tossPaymentClient;
    }

    @Transactional
    public LiveAdmissionResponse confirm(Long streamId, Long memberId, PaymentConfirmRequest request) {
        LiveAdmissionPayment existing = paymentRepository
                .findByStream_IdAndMember_IdAndStatus(streamId, memberId, SUCCESS)
                .orElse(null);
        if (existing != null) return toResponse(existing);

        LiveStream stream = liveStreamRepository.findById(streamId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "방송을 찾을 수 없습니다."));
        if (stream.getStatus() != LiveStreamStatus.LIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "진행 중인 방송만 입장권을 결제할 수 있습니다.");
        }
        if (!stream.isPaid()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "무료 방송은 입장권 결제가 필요하지 않습니다.");
        }

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 정보를 찾을 수 없습니다."));
        if (stream.isOwnedBy(memberId) || member.getRole() == MemberRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "방송 관리자에게는 입장권 결제가 필요하지 않습니다.");
        }
        if (stream.getEntranceFee().compareTo(request.amount()) != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "결제 금액이 방송 입장료와 일치하지 않습니다.");
        }
        if (!request.orderId().startsWith("LIVE_" + streamId + "_")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "방송 입장권 주문번호가 올바르지 않습니다.");
        }

        TossConfirmResponse confirmed = tossPaymentClient.confirm(
                request.paymentKey(),
                request.orderId(),
                request.amount()
        );
        LiveAdmissionPayment payment = paymentRepository.save(new LiveAdmissionPayment(
                stream,
                member,
                request.orderId(),
                request.paymentKey(),
                confirmed.method(),
                request.amount(),
                LocalDateTime.now()
        ));
        return toResponse(payment);
    }

    private LiveAdmissionResponse toResponse(LiveAdmissionPayment payment) {
        return new LiveAdmissionResponse(
                payment.getPaymentId(),
                payment.getStream().getId(),
                payment.getStream().getTitle(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getStatus(),
                payment.getPaidAt()
        );
    }
}
