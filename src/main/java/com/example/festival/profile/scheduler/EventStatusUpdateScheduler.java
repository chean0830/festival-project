package com.example.festival.profile.scheduler;

import com.example.festival.profile.service.ProfileService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * event.status(UPCOMING/ONGOING/ENDED)가 실제 날짜와 어긋나 있으면 바로잡는 배치.
 * 서버 기동 직후 한 번 실행하고(테스트/데모에서 바로 확인 가능하도록), 이후 24시간마다 반복한다.
 */
@Component
public class EventStatusUpdateScheduler {

    private final ProfileService profileService;

    public EventStatusUpdateScheduler(ProfileService profileService) {
        this.profileService = profileService;
    }

    @Scheduled(initialDelay = 0, fixedDelay = 24 * 60 * 60 * 1000)
    public void refreshEventStatuses() {
        profileService.refreshEventStatusesByDate();
    }
}