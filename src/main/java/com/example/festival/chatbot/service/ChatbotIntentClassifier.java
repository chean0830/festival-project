package com.example.festival.chatbot.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 사용자 메시지 1건을 Gemini에 1회 호출해서 의도(intent)와 슬롯(공연명/아티스트명/일수/요일)을
 * JSON으로만 뽑아낸다. 파싱에 실패하면 GENERAL로 안전하게 폴백한다.
 */
@Slf4j
@Component
public class ChatbotIntentClassifier {

    private static final String PROMPT_TEMPLATE = """
            너는 페스티벌 챗봇의 의도 분류기다. 아래 사용자 메시지를 분석해서 JSON 한 줄로만 답하라. JSON 외의 다른 설명은 절대 출력하지 마라.

            intent는 다음 중 하나여야 한다:
            - EVENT_INFO: 특정 공연/페스티벌의 시작일, 장소, 주차, 입장 가능 시간 등 사실 질문
            - ARTIST_TIME: 특정 아티스트/밴드의 공연 시간 질문
            - VENUE_FACT: 공연 이름 없이 일반적으로 주차/입장 가능 시간을 묻는 질문
            - RECOMMEND_PERSONAL: 취향에 맞는 공연/페스티벌 추천 요청
            - RECOMMEND_DDAY: 얼마 남지 않은(임박한) 공연 목록 요청
            - RECOMMEND_BY_DAY: 특정 요일에 볼만한 공연 추천 요청
            - TASTE_ANALYSIS: 내 취향을 분석해달라는 요청
            - OUTFIT_SUGGESTION: 공연장에 어울리는 옷차림/코디 추천 요청
            - GENERAL: 위에 해당하지 않는 그 외 모든 경우

            JSON 형식(키를 정확히 지켜라):
            {"intent": "위 중 하나", "eventName": "언급된 공연/페스티벌 이름 또는 null", "artistName": "언급된 아티스트/밴드 이름 또는 null", "days": 며칠 이내인지 숫자 또는 null, "dayOfWeek": "MONDAY/TUESDAY/WEDNESDAY/THURSDAY/FRIDAY/SATURDAY/SUNDAY 중 하나 또는 null"}

            사용자 메시지: "%s"
            """;

    private final AiProxyClient aiProxyClient;
    private final ObjectMapper objectMapper;

    public ChatbotIntentClassifier(AiProxyClient aiProxyClient, ObjectMapper objectMapper) {
        this.aiProxyClient = aiProxyClient;
        this.objectMapper = objectMapper;
    }

    public ChatbotSlots classify(String message) {
        if (!aiProxyClient.isConfigured()) {
            return ChatbotSlots.general();
        }
        try {
            String raw = aiProxyClient.generateText(PROMPT_TEMPLATE.formatted(message));
            JsonNode node = objectMapper.readTree(extractJson(raw));
            ChatbotIntent intent = parseIntent(node.path("intent").asText(""));
            return new ChatbotSlots(
                    intent,
                    textOrNull(node, "eventName"),
                    textOrNull(node, "artistName"),
                    node.hasNonNull("days") ? node.path("days").asInt() : null,
                    textOrNull(node, "dayOfWeek")
            );
        } catch (Exception e) {
            log.warn("챗봇 의도 분류 실패, GENERAL로 폴백: {}", e.getMessage());
            return ChatbotSlots.general();
        }
    }

    private ChatbotIntent parseIntent(String value) {
        try {
            return ChatbotIntent.valueOf(value.trim().toUpperCase());
        } catch (Exception e) {
            return ChatbotIntent.GENERAL;
        }
    }

    private String textOrNull(JsonNode node, String field) {
        if (!node.hasNonNull(field)) {
            return null;
        }
        String value = node.path(field).asText();
        return value.isBlank() ? null : value.trim();
    }

    private String extractJson(String raw) {
        int start = raw.indexOf('{');
        int end = raw.lastIndexOf('}');
        if (start < 0 || end < start) {
            throw new IllegalArgumentException("응답에서 JSON을 찾을 수 없습니다: " + raw);
        }
        return raw.substring(start, end + 1);
    }

    public record ChatbotSlots(
            ChatbotIntent intent,
            String eventName,
            String artistName,
            Integer days,
            String dayOfWeek
    ) {
        public static ChatbotSlots general() {
            return new ChatbotSlots(ChatbotIntent.GENERAL, null, null, null, null);
        }
    }
}
