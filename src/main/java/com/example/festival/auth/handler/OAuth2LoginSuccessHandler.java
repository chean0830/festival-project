package com.example.festival.auth.handler;

import com.example.festival.auth.controller.AuthController;
import com.example.festival.auth.security.MemberPrincipal;
import com.example.festival.auth.service.OAuth2AccountService;

import com.example.festival.member.entity.Member;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Component;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final OAuth2AccountService accountService;
    private final SecurityContextRepository securityContextRepository;
    private final OAuth2AuthorizedClientRepository authorizedClientRepository;
    private final String frontendUrl;

    public OAuth2LoginSuccessHandler(
            OAuth2AccountService accountService,
            SecurityContextRepository securityContextRepository,
            OAuth2AuthorizedClientRepository authorizedClientRepository,
            @Value("${app.frontend-url}") String frontendUrl
    ) {
        this.accountService = accountService;
        this.securityContextRepository = securityContextRepository;
        this.authorizedClientRepository = authorizedClientRepository;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String registrationId = oauthToken.getAuthorizedClientRegistrationId();
        Member member = accountService.loginOrSignup(
                registrationId,
                oauthToken.getPrincipal().getAttributes()
        );

        if ("kakao".equals(registrationId)) {
            saveKakaoTokens(member.getId(), oauthToken, request);
        }

        MemberPrincipal principal = MemberPrincipal.from(member);
        Authentication memberAuthentication = UsernamePasswordAuthenticationToken.authenticated(
                principal,
                null,
                principal.getAuthorities()
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(memberAuthentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        Object storedReturnTo = request.getSession().getAttribute(AuthController.OAUTH_RETURN_TO_SESSION_KEY);
        request.getSession().removeAttribute(AuthController.OAUTH_RETURN_TO_SESSION_KEY);
        String returnTo = storedReturnTo instanceof String value
                && value.startsWith("/")
                && !value.startsWith("//")
                ? value
                : "/";
        response.sendRedirect(frontendUrl + returnTo);
    }

    /**
     * talk_message 동의를 받은 카카오 로그인이면, 이 시점에 세션에 저장된 access_token/refresh_token을
     * 꺼내서 DB에 저장해둔다. 나중에 카카오톡 알림을 보낼 때 이 토큰을 쓴다.
     */
    private void saveKakaoTokens(Long memberId, OAuth2AuthenticationToken oauthToken, HttpServletRequest request) {
        OAuth2AuthorizedClient authorizedClient = authorizedClientRepository.loadAuthorizedClient(
                oauthToken.getAuthorizedClientRegistrationId(),
                oauthToken,
                request
        );
        if (authorizedClient == null) {
            return;
        }

        OAuth2AccessToken accessToken = authorizedClient.getAccessToken();
        OAuth2RefreshToken refreshToken = authorizedClient.getRefreshToken();
        LocalDateTime expiresAt = accessToken.getExpiresAt() == null
                ? null
                : LocalDateTime.ofInstant(accessToken.getExpiresAt(), ZoneId.systemDefault());

        accountService.saveKakaoTokens(
                memberId,
                accessToken.getTokenValue(),
                refreshToken == null ? null : refreshToken.getTokenValue(),
                expiresAt
        );
    }
}
