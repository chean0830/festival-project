package com.example.festival.member.dto;

import com.example.festival.member.entity.Member;

public record AccountResponse(
        String email,
        String phoneNumber,
        String postalCode,
        String roadAddress,
        String detailAddress
) {
    public static AccountResponse from(Member member) {
        return new AccountResponse(
                member.getEmail(), member.getPhoneNumber(), member.getPostalCode(),
                member.getRoadAddress(), member.getDetailAddress()
        );
    }
}
