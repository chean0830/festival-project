package com.example.festival.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/**
 * Gemini generateContent API 응답 중 우리가 실제로 쓰는 필드만 매핑한다.
 * 이미지 모델 응답은 candidates[0].content.parts[].inlineData.{mimeType,data}로,
 * 텍스트 모델 응답은 candidates[0].content.parts[].text로 온다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record GeminiGenerateContentResponse(List<Candidate> candidates) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Candidate(Content content) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Content(List<Part> parts) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Part(String text, InlineData inlineData) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record InlineData(String mimeType, String data) {
    }
}
