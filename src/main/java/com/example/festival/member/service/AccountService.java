package com.example.festival.member.service;

import com.example.festival.member.dto.AccountResponse;
import com.example.festival.member.dto.AccountUpdateRequest;
import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class AccountService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountService(MemberRepository memberRepository, PasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AccountResponse getAccount(Long memberId) {
        return AccountResponse.from(findMember(memberId));
    }

    @Transactional
    public AccountResponse updateAccount(Long memberId, AccountUpdateRequest request) {
        Member member = findMember(memberId);
        String phoneNumber = request.phoneNumber().replaceAll("[^0-9]", "");
        if (memberRepository.existsByPhoneNumberAndIdNot(phoneNumber, memberId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 휴대전화번호입니다.");
        }
        member.changeContact(
                phoneNumber,
                trimToNull(request.postalCode()),
                request.roadAddress().trim(),
                trimToNull(request.detailAddress())
        );
        return AccountResponse.from(member);
    }

    @Transactional
    public void changePassword(Long memberId, String currentPassword, String newPassword) {
        Member member = findMember(memberId);
        if (member.getPassword() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.");
        }
        if (!passwordEncoder.matches(currentPassword, member.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 비밀번호입니다.");
        }
        member.changePassword(passwordEncoder.encode(newPassword));
    }

    @Transactional
    public void withdraw(Long memberId, String currentPassword) {
        Member member = findMember(memberId);
        if (member.getPassword() != null
                && (currentPassword == null || !passwordEncoder.matches(currentPassword, member.getPassword()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "현재 비밀번호가 올바르지 않습니다.");
        }
        member.withdraw();
    }

    private Member findMember(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원 정보를 찾을 수 없습니다."));
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
