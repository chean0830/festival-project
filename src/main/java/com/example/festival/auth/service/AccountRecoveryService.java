package com.example.festival.auth.service;

import com.example.festival.auth.dto.FindEmailResponse;
import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import com.example.festival.member.entity.PasswordResetToken;
import com.example.festival.member.repository.PasswordResetTokenRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AccountRecoveryService {

    private final MemberRepository memberRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordResetMailService mailService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();
    private final long expirationMinutes;

    public AccountRecoveryService(
            MemberRepository memberRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordResetMailService mailService,
            PasswordEncoder passwordEncoder,
            @Value("${app.password-reset.expiration-minutes:30}") long expirationMinutes
    ) {
        this.memberRepository = memberRepository;
        this.tokenRepository = tokenRepository;
        this.mailService = mailService;
        this.passwordEncoder = passwordEncoder;
        this.expirationMinutes = expirationMinutes;
    }

    @Transactional(readOnly = true)
    public FindEmailResponse findEmail(String nickname, String phoneNumber) {
        String normalizedPhone = phoneNumber.replaceAll("[^0-9]", "");
        return memberRepository.findByNicknameAndPhoneNumber(nickname.trim(), normalizedPhone)
                .map(member -> new FindEmailResponse(
                        true,
                        maskEmail(member.getEmail()),
                        "가입한 이메일을 찾았습니다."
                ))
                .orElseGet(() -> new FindEmailResponse(
                        false,
                        null,
                        "일치하는 계정을 찾을 수 없습니다."
                ));
    }

    @Transactional
    public void requestPasswordReset(String requestedEmail) {
        String email = requestedEmail.trim().toLowerCase(Locale.ROOT);
        memberRepository.findByEmailIgnoreCase(email).ifPresent(member -> {
            if (member.getPassword() == null) {
                return;
            }

            LocalDateTime now = LocalDateTime.now();
            tokenRepository.invalidateActiveTokens(member.getId(), now);

            String rawToken = createRawToken();
            tokenRepository.save(new PasswordResetToken(
                    member,
                    hashToken(rawToken),
                    now.plusMinutes(expirationMinutes)
            ));
            mailService.send(member.getEmail(), rawToken);
        });
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        PasswordResetToken token = tokenRepository.findByTokenHashAndUsedAtIsNull(hashToken(rawToken))
                .orElseThrow(() -> invalidToken());
        LocalDateTime now = LocalDateTime.now();
        if (token.isExpired(now)) {
            token.markUsed(now);
            throw invalidToken();
        }

        Member member = token.getMember();
        member.changePassword(passwordEncoder.encode(newPassword));
        token.markUsed(now);
        tokenRepository.invalidateActiveTokens(member.getId(), now);
    }

    private String createRawToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256을 사용할 수 없습니다.", exception);
        }
    }

    private String maskEmail(String email) {
        int at = email.indexOf('@');
        String local = email.substring(0, at);
        int visibleLength = Math.min(3, Math.max(1, local.length()));
        return local.substring(0, visibleLength) + "***" + email.substring(at);
    }

    private ResponseStatusException invalidToken() {
        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "재설정 링크가 만료되었거나 이미 사용되었습니다."
        );
    }
}
