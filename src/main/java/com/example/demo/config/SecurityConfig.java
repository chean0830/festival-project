package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * TEMPORARY 설정.
 * 아직 로그인/인증(소셜로그인 - 석철 담당)이 구현되지 않은 상태라, 팀 전체가 API를
 * 테스트할 수 있도록 임시로 전체 요청을 permitAll 처리했다.
 * 실제 인증 로직이 들어오면 이 클래스는 석철님의 SecurityConfig로 교체/통합되어야 한다.
 * merge 시 반드시 조율 필요.
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
