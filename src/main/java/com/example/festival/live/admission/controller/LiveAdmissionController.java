package com.example.festival.live.admission.controller;

import com.example.festival.auth.security.MemberPrincipal;
import com.example.festival.live.admission.dto.LiveAdmissionResponse;
import com.example.festival.live.admission.service.LiveAdmissionPaymentService;
import com.example.festival.payment.dto.PaymentConfirmRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/live-streams")
public class LiveAdmissionController {

    private final LiveAdmissionPaymentService paymentService;

    public LiveAdmissionController(LiveAdmissionPaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/{streamId}/admission/payments/confirm")
    public LiveAdmissionResponse confirm(
            @PathVariable Long streamId,
            @AuthenticationPrincipal MemberPrincipal principal,
            @Valid @RequestBody PaymentConfirmRequest request
    ) {
        return paymentService.confirm(streamId, principal.getMemberId(), request);
    }
}
