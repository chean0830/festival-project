package com.example.demo.auth;

import com.example.demo.auth.dto.SignupRequest;
import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(MemberRepository memberRepository, PasswordEncoder passwordEncoder) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Member signup(SignupRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String phoneNumber = request.phoneNumber().replaceAll("[^0-9]", "");
        String nickname = request.nickname().trim();

        if (memberRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 가입된 이메일입니다.");
        }
        if (memberRepository.existsByNickname(nickname)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다.");
        }
        if (memberRepository.existsByPhoneNumber(phoneNumber)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 가입된 휴대폰 번호입니다.");
        }

        Member member = Member.emailMember(
                email,
                passwordEncoder.encode(request.password()),
                phoneNumber,
                request.postalCode().trim(),
                request.roadAddress().trim(),
                request.detailAddress().trim(),
                nickname
        );
        return memberRepository.save(member);
    }
}
