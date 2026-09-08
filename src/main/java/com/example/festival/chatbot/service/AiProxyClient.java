package com.example.festival.chatbot.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;

/**
 * 챗봇의 AI 호출을 별도 프록시 서버(ai-proxy-server, 기본 포트 8081)로 위임한다.
 * Gemini API 키/모델 설정은 프록시 서버 쪽에만 있고, 메인 백엔드는 이 클라이언트를 통해서만 AI를 호출한다.
 * (com.example.festival.ai.GeminiTextClient는 AI 일기/포스터 기능이 계속 직접 사용 중이라 그대로 둠 — 챗봇만 분리했다.)
 */
@Slf4j
@Component
public class AiProxyClient {

    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(3);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(20);

    private final RestClient restClient;
    private final boolean configured;

    public AiProxyClient(@Value("${app.ai-proxy.base-url:http://localhost:8081}") String baseUrl) {
        this.configured = baseUrl != null && !baseUrl.isBlank();

        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(CONNECT_TIMEOUT)
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(READ_TIMEOUT);

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();
    }

    public boolean isConfigured() {
        return configured;
    }

    public String generateText(String prompt) {
        try {
            Map<String, String> response = restClient.post()
                    .uri("/internal/ai/generate")
                    .body(Map.of("prompt", prompt))
                    .retrieve()
                    .body(Map.class);

            Object text = response != null ? response.get("text") : null;
            if (text == null || text.toString().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 프록시가 응답을 만들지 못했습니다.");
            }
            return text.toString();
        } catch (RestClientResponseException e) {
            log.warn("AI 프록시 호출 실패: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 프록시 호출에 실패했습니다.");
        } catch (RestClientException e) {
            log.warn("AI 프록시에 연결하지 못했습니다.", e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 프록시 서버에 연결하지 못했습니다.");
        }
    }
}
