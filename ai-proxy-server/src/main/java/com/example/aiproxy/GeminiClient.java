package com.example.aiproxy;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

/**
 * Gemini 텍스트 모델(generateContent API) 호출을 이 프록시 서버 안에 캡슐화한다.
 * 메인 백엔드(festival)의 com.example.festival.ai.GeminiTextClient와 별개다 —
 * 그쪽은 AI 일기/포스터 기능이 계속 쓰고 있어서 건드리지 않았고, 챗봇의 AI 호출만 이 프록시로 분리했다.
 */
@Slf4j
@Component
public class GeminiClient {

    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public GeminiClient(
            @Value("${app.ai.gemini.api-key:}") String apiKey,
            @Value("${app.ai.gemini.text-model:gemini-3.1-flash-lite}") String model
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.restClient = RestClient.create(BASE_URL);
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String generateText(String prompt) {
        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
        );

        try {
            GeminiGenerateContentResponse response = restClient.post()
                    .uri("/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .body(body)
                    .retrieve()
                    .body(GeminiGenerateContentResponse.class);

            return extractText(response);
        } catch (RestClientResponseException e) {
            log.warn("Gemini 텍스트 생성 실패: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 응답 생성에 실패했습니다.");
        } catch (RestClientException e) {
            log.warn("Gemini 호출 중 오류", e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 서비스에 연결하지 못했습니다.");
        }
    }

    private String extractText(GeminiGenerateContentResponse response) {
        if (response != null && response.candidates() != null) {
            for (GeminiGenerateContentResponse.Candidate candidate : response.candidates()) {
                if (candidate.content() == null || candidate.content().parts() == null) {
                    continue;
                }
                for (GeminiGenerateContentResponse.Part part : candidate.content().parts()) {
                    if (part.text() != null && !part.text().isBlank()) {
                        return part.text().trim();
                    }
                }
            }
        }
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI가 응답을 만들지 못했습니다.");
    }
}
