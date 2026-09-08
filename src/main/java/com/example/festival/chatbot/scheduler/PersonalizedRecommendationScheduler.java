package com.example.festival.chatbot.scheduler;

import com.example.festival.chatbot.service.PersonalizedRecommendationNotifier;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 취향 기반 공연 추천을 알림으로 선제 발송하는 배치.
 * 서버 기동 직후 한 번 실행하고(테스트/데모에서 바로 확인 가능하도록), 이후 24시간마다 반복한다.
 */
@Component
public class PersonalizedRecommendationScheduler {

    private final PersonalizedRecommendationNotifier notifier;

    public PersonalizedRecommendationScheduler(PersonalizedRecommendationNotifier notifier) {
        this.notifier = notifier;
    }

    @Scheduled(initialDelay = 0, fixedDelay = 24 * 60 * 60 * 1000)
    public void notifyPersonalizedRecommendations() {
        notifier.notifyPersonalizedRecommendations();
    }
}
