package com.example.festival.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * Gemini 이미지 생성 모델(일명 nano-banana, generateContent API)을 호출해서
 * 참고 사진 + 텍스트 프롬프트로 포스터 이미지 한 장을 합성한다.
 * 사업자등록 없이 발급되는 API 키를 쓰지만, 이 모델은 무료 티어가 없어 호출마다 과금된다.
 */
@Slf4j
@Component
public class GeminiPosterClient {

    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public GeminiPosterClient(
            @Value("${app.ai.gemini.api-key:}") String apiKey,
            @Value("${app.ai.gemini.image-model:gemini-3.1-flash-lite-image}") String model
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.restClient = RestClient.create(BASE_URL);
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public GeneratedImage generatePoster(String prompt, List<byte[]> referenceImages, List<String> mimeTypes) {
        List<Map<String, Object>> parts = new ArrayList<>();
        for (int i = 0; i < referenceImages.size(); i++) {
            parts.add(Map.of("inlineData", Map.of(
                    "mimeType", mimeTypes.get(i),
                    "data", Base64.getEncoder().encodeToString(referenceImages.get(i))
            )));
        }
        parts.add(Map.of("text", prompt));

        Map<String, Object> body = Map.of("contents", List.of(Map.of("parts", parts)));

        try {
            GeminiGenerateContentResponse response = restClient.post()
                    .uri("/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .body(body)
                    .retrieve()
                    .body(GeminiGenerateContentResponse.class);

            GeminiGenerateContentResponse.InlineData image = extractImage(response);
            byte[] imageBytes = Base64.getDecoder().decode(image.data());
            String mimeType = image.mimeType() != null ? image.mimeType() : "image/jpeg";
            return new GeneratedImage(imageBytes, mimeType);
        } catch (RestClientResponseException e) {
            log.warn("Gemini 포스터 생성 실패: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 포스터 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } catch (RestClientException e) {
            log.warn("Gemini 호출 중 오류", e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI 포스터 생성 서비스에 연결하지 못했습니다.");
        }
    }

    private GeminiGenerateContentResponse.InlineData extractImage(GeminiGenerateContentResponse response) {
        if (response != null && response.candidates() != null) {
            for (GeminiGenerateContentResponse.Candidate candidate : response.candidates()) {
                if (candidate.content() == null || candidate.content().parts() == null) {
                    continue;
                }
                for (GeminiGenerateContentResponse.Part part : candidate.content().parts()) {
                    if (part.inlineData() != null && part.inlineData().data() != null) {
                        return part.inlineData();
                    }
                }
            }
        }
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI가 포스터 이미지를 만들지 못했습니다.");
    }

    public record GeneratedImage(byte[] bytes, String mimeType) {
    }
}
