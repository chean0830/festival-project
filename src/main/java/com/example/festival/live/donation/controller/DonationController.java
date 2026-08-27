package com.example.festival.live.donation.controller;

import com.example.festival.auth.security.MemberPrincipal;
import com.example.festival.live.donation.dto.DonationCreateRequest;
import com.example.festival.live.donation.dto.DonationResponse;
import com.example.festival.live.donation.service.DonationService;
import com.example.festival.payment.dto.PaymentConfirmRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/live-streams")
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @PostMapping("/{streamId}/donations")
    @ResponseStatus(HttpStatus.CREATED)
    public DonationResponse create(
            @PathVariable Long streamId,
            @AuthenticationPrincipal MemberPrincipal principal,
            @Valid @RequestBody DonationCreateRequest request
    ) {
        return donationService.create(streamId, principal.getMemberId(), request);
    }

    @PostMapping("/donations/{donationId}/payments/confirm")
    public DonationResponse confirm(
            @PathVariable Long donationId,
            @AuthenticationPrincipal MemberPrincipal principal,
            @Valid @RequestBody PaymentConfirmRequest request
    ) {
        return donationService.confirm(donationId, principal.getMemberId(), request);
    }
}
