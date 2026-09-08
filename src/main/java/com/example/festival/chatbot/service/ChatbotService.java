package com.example.festival.chatbot.service;

import com.example.festival.chatbot.dto.ChatMessageResponse;
import com.example.festival.chatbot.dto.ChatbotAction;
import com.example.festival.festivalrecord.repository.FestivalRecordRepository;
import com.example.festival.visit.entity.EventVisit;
import com.example.festival.visit.repository.EventVisitRepository;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.List;

/**
 * 챗봇 진입점: 의도 분류 -> 도메인별 처리(사실 조회는 결정론적으로, 추천/분석은 LLM 설명 생성) -> 응답 조립.
 */
@Slf4j
@Service
public class ChatbotService {

    private static final String SYSTEM_RULES = """
            너는 페스티벌 전문 AI 어시스턴트다.
            사용자의 공연 취향과 페스티벌 데이터를 기반으로 답변한다.
            아래 [제공된 사실 정보]에 없는 공연 정보는 절대 임의로 만들어내지 않는다.
            공연을 추천할 때는 왜 추천하는지 이유를 함께 설명한다.
            확인되지 않은 사실은 답하지 않고, 정보가 부족하면 부족하다고 솔직히 말한다.
            """;

    private final ChatbotIntentClassifier intentClassifier;
    private final ChatbotFactService factService;
    private final ChatbotRecommendationService recommendationService;
    private final AiProxyClient aiProxyClient;
    private final EventVisitRepository eventVisitRepository;
    private final FestivalRecordRepository festivalRecordRepository;

    public ChatbotService(
            ChatbotIntentClassifier intentClassifier,
            ChatbotFactService factService,
            ChatbotRecommendationService recommendationService,
            AiProxyClient aiProxyClient,
            EventVisitRepository eventVisitRepository,
            FestivalRecordRepository festivalRecordRepository
    ) {
        this.intentClassifier = intentClassifier;
        this.factService = factService;
        this.recommendationService = recommendationService;
        this.aiProxyClient = aiProxyClient;
        this.eventVisitRepository = eventVisitRepository;
        this.festivalRecordRepository = festivalRecordRepository;
    }

    public ChatMessageResponse handleMessage(Long memberId, String message) {
        ChatbotIntentClassifier.ChatbotSlots slots = intentClassifier.classify(message);

        String reply = switch (slots.intent()) {
            case EVENT_INFO -> factService.answerEventInfo(slots.eventName(), message);
            case ARTIST_TIME -> factService.answerArtistTime(slots.artistName());
            case VENUE_FACT -> factService.answerVenueFact();
            case RECOMMEND_DDAY -> factService.answerDday(slots.days());
            case RECOMMEND_PERSONAL ->
                    composeWithFacts(message, recommendationService.buildPersonalRecommendationFacts(memberId));
            case RECOMMEND_BY_DAY -> {
                DayOfWeek dayOfWeek = recommendationService.parseDayOfWeek(slots.dayOfWeek(), message);
                yield composeWithFacts(message, recommendationService.buildByDayFacts(memberId, dayOfWeek));
            }
            case TASTE_ANALYSIS -> composeWithFacts(message, recommendationService.buildTasteAnalysisFacts(memberId));
            case OUTFIT_SUGGESTION ->
                    composeWithFacts(message, recommendationService.buildOutfitFacts(slots.eventName()));
            case GENERAL -> composeGeneral(message);
        };

        return new ChatMessageResponse(reply, null);
    }

    public ChatMessageResponse greeting(Long memberId) {
        List<EventVisit> endedVisits = eventVisitRepository.findAllForEndedEvents();
        for (EventVisit visit : endedVisits) {
            if (!visit.getMember().getId().equals(memberId)) {
                continue;
            }
            Long eventId = visit.getEvent().getEventId();
            if (!festivalRecordRepository.existsByMember_IdAndEvent_EventId(memberId, eventId)) {
                String text = "오늘 " + visit.getEvent().getName() + " 다녀오셨네요! 공연 기록을 만들어드릴까요?";
                return new ChatMessageResponse(text, new ChatbotAction("NAVIGATE_RECORD", eventId));
            }
        }
        return new ChatMessageResponse("안녕하세요! 공연 시간, 맞춤 추천, 취향 분석 등 무엇이든 물어보세요.", null);
    }

    private String composeWithFacts(String message, String factBlock) {
        if (!aiProxyClient.isConfigured()) {
            return factBlock;
        }
        try {
            String prompt = SYSTEM_RULES
                    + "\n[제공된 사실 정보]\n" + factBlock
                    + "\n[사용자 질문]\n" + message
                    + "\n\n위 사실 정보만 근거로 친근한 말투로 답변하세요. 추천이라면 왜 추천하는지 이유를 반드시 포함하세요.";
            return aiProxyClient.generateText(prompt);
        } catch (Exception e) {
            log.warn("챗봇 설명 생성 실패, 사실 정보만 반환: {}", e.getMessage());
            return factBlock;
        }
    }

    private String composeGeneral(String message) {
        if (!aiProxyClient.isConfigured()) {
            return "안녕하세요! 지금은 AI 응답을 만들 수 없지만, 공연 시간이나 추천을 물어보시면 데이터로 확인해드릴게요.";
        }
        try {
            String prompt = SYSTEM_RULES
                    + "\n[사용자 질문]\n" + message
                    + "\n\n페스티벌과 관련 없는 질문이면 정중히 페스티벌 관련 질문을 하도록 안내하세요.";
            return aiProxyClient.generateText(prompt);
        } catch (Exception e) {
            log.warn("챗봇 일반 응답 생성 실패: {}", e.getMessage());
            return "죄송해요, 지금은 답변을 만들지 못했어요. 잠시 후 다시 시도해주세요.";
        }
    }
}