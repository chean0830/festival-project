package com.example.demo.auth.dto;

import com.example.demo.auth.MemberPrincipal;
import com.example.demo.member.Member;

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
