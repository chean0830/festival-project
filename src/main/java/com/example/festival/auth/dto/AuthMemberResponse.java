package com.example.festival.auth.dto;

import com.example.festival.auth.security.MemberPrincipal;
import com.example.festival.member.entity.Member;

public record AuthMemberResponse(
        Long memberId,
        String email,
        String nickname,
        String profileImage
) {
    public static AuthMemberResponse from(Member member) {
        return new AuthMemberResponse(
                member.getId(),
                member.getEmail(),
                member.getNickname(),
                member.getProfileImage()
        );
    }

    public static AuthMemberResponse from(MemberPrincipal principal) {
        return new AuthMemberResponse(
                principal.getMemberId(),
                principal.getEmail(),
                principal.getNickname(),
                principal.getProfileImage()
        );
    }
}
