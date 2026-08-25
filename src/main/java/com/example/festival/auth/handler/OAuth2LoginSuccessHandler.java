package com.example.festival.auth.handler;

import com.example.festival.auth.controller.AuthController;
import com.example.festival.auth.security.MemberPrincipal;
import com.example.festival.auth.service.OAuth2AccountService;

import com.example.festival.member.entity.Member;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Component;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final OAuth2AccountService accountService;
    private final SecurityContextRepository securityContextRepository;
    private final String frontendUrl;

    public OAuth2LoginSuccessHandler(
            OAuth2AccountService accountService,
            SecurityContextRepository securityContextRepository,
            @Value("${app.frontend-url}") String frontendUrl
    ) {
        this.accountService = accountService;
        this.securityContextRepository = securityContextRepository;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        Member member = accountService.loginOrSignup(
                oauthToken.getAuthorizedClientRegistrationId(),
                oauthToken.getPrincipal().getAttributes()
        );

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
}
