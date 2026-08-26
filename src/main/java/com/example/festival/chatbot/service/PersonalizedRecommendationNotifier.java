package com.example.festival.chatbot.service;

import com.example.festival.event.entity.Event;
import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import com.example.festival.notification.service.NotificationService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 챗봇의 취향 기반 추천 로직(ChatbotRecommendationService)을 재사용해서,
 * 사용자가 먼저 챗봇에게 묻지 않아도 선호 장르에 맞는 예정 공연을 알림으로 선제 안내한다.
 * 순수 DB 조회/집계만 사용하므로 AI(Gemini) 호출이 없다 — 추가 과금 없음.
 * PersonalizedRecommendationScheduler가 주기적으로 호출한다.
 */
@Service
public class PersonalizedRecommendationNotifier {

    private static final String NOTIFICATION_TYPE = "PERSONALIZED_RECOMMENDATION";
    private static final int MAX_CANDIDATES_PER_MEMBER = 3;

    private final MemberRepository memberRepository;
    private final NotificationService notificationService;
    private final ChatbotRecommendationService recommendationService;

    public PersonalizedRecommendationNotifier(
            MemberRepository memberRepository,
            NotificationService notificationService,
            ChatbotRecommendationService recommendationService
    ) {
        this.memberRepository = memberRepository;
        this.notificationService = notificationService;
        this.recommendationService = recommendationService;
    }

    @Transactional
    public void notifyPersonalizedRecommendations() {
        for (Member member : memberRepository.findAll()) {
            List<Event> candidates = recommendationService
                    .findTopPersonalizedCandidates(member.getId(), MAX_CANDIDATES_PER_MEMBER);

            for (Event event : candidates) {
                if (notificationService.hasNotified(member.getId(), event.getEventId(), NOTIFICATION_TYPE)) {
                    continue;
                }
                notificationService.notifyMember(
                        member.getId(),
                        event.getEventId(),
                        NOTIFICATION_TYPE,
                        "취향에 맞는 공연이 있어요!",
                        event.getName() + " 공연이 회원님 취향에 맞을 것 같아요. 확인해보세요!"
                );
            }
        }
    }
}
