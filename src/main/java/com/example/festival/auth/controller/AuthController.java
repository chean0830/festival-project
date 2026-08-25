package com.example.festival.auth.controller;

import com.example.festival.auth.security.MemberPrincipal;
import com.example.festival.auth.service.AccountRecoveryService;
import com.example.festival.auth.service.AuthService;
import com.example.festival.live.service.LiveStreamService;

import com.example.festival.auth.dto.AuthMemberResponse;
import com.example.festival.auth.dto.FindEmailRequest;
import com.example.festival.auth.dto.FindEmailResponse;
import com.example.festival.auth.dto.LoginRequest;
import com.example.festival.auth.dto.MessageResponse;
import com.example.festival.auth.dto.PasswordResetConfirmRequest;
import com.example.festival.auth.dto.PasswordResetRequest;
import com.example.festival.auth.dto.SignupRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public static final String OAUTH_RETURN_TO_SESSION_KEY = "OAUTH_RETURN_TO";
    private static final Set<String> OAUTH_PROVIDERS = Set.of("google", "kakao", "naver");

    private final AuthService authService;
    private final AccountRecoveryService accountRecoveryService;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final LiveStreamService liveStreamService;

    public AuthController(
            AuthService authService,
            AccountRecoveryService accountRecoveryService,
            AuthenticationManager authenticationManager,
            SecurityContextRepository securityContextRepository,
            LiveStreamService liveStreamService
    ) {
        this.authService = authService;
        this.accountRecoveryService = accountRecoveryService;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.liveStreamService = liveStreamService;
    }

    @GetMapping("/csrf")
    public CsrfToken csrf(CsrfToken token) {
        return token;
    }

    @GetMapping("/oauth2/start/{provider}")
    public void startOAuthLogin(
            @PathVariable String provider,
            @RequestParam(defaultValue = "/") String returnTo,
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        if (!OAUTH_PROVIDERS.contains(provider)) {
            response.sendError(HttpStatus.BAD_REQUEST.value(), "지원하지 않는 소셜 로그인입니다.");
            return;
        }
        String safeReturnTo = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
        request.getSession(true).setAttribute(OAUTH_RETURN_TO_SESSION_KEY, safeReturnTo);
        response.sendRedirect("/oauth2/authorization/" + provider);
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthMemberResponse signup(@Valid @RequestBody SignupRequest request) {
        return AuthMemberResponse.from(authService.signup(request));
    }

    @PostMapping("/find-email")
    public FindEmailResponse findEmail(@Valid @RequestBody FindEmailRequest request) {
        return accountRecoveryService.findEmail(request.nickname(), request.phoneNumber());
    }

    @PostMapping("/password-reset/request")
    public MessageResponse requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        accountRecoveryService.requestPasswordReset(request.email());
        return new MessageResponse("가입된 이메일이라면 비밀번호 재설정 안내를 보냈습니다.");
    }

    @PostMapping("/password-reset/confirm")
    public MessageResponse confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequest request) {
        accountRecoveryService.resetPassword(request.token(), request.password());
        return new MessageResponse("비밀번호가 변경되었습니다.");
    }

    @PostMapping("/login")
    public AuthMemberResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(request.email(), request.password())
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, httpRequest, httpResponse);

        return AuthMemberResponse.from((MemberPrincipal) authentication.getPrincipal());
    }

    @GetMapping("/me")
    public AuthMemberResponse me(Authentication authentication) {
        return AuthMemberResponse.from((MemberPrincipal) authentication.getPrincipal());
    }

    @PostMapping("/logout")
    public MessageResponse logout(
            @AuthenticationPrincipal MemberPrincipal principal,
            HttpServletRequest request
    ) {
        boolean liveStreamEnded = false;
        if (principal != null) {
            liveStreamEnded = liveStreamService.endActiveStreamsForLogout(principal.getMemberId());
        }
        if (request.getSession(false) != null) {
            request.getSession(false).invalidate();
        }
        SecurityContextHolder.clearContext();
        return new MessageResponse(
                liveStreamEnded
                        ? "라이브 방송이 종료되고 로그아웃되었습니다."
                        : "로그아웃되었습니다."
        );
    }
}
