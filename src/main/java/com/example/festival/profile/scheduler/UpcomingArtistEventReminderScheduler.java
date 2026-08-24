package com.example.festival.profile.scheduler;

import com.example.festival.profile.service.ProfileService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 관심 등록한 아티스트가 출연하는 공연의 시작일이 임박한 회원들에게 알림을 보내는 배치.
 * 서버 기동 직후 한 번 실행하고(테스트/데모에서 바로 확인 가능하도록), 이후 24시간마다 반복한다.
 */
@Component
public class UpcomingArtistEventReminderScheduler {

    private final ProfileService profileService;

    public UpcomingArtistEventReminderScheduler(ProfileService profileService) {
        this.profileService = profileService;
    }

    @Scheduled(initialDelay = 0, fixedDelay = 24 * 60 * 60 * 1000)
    public void notifyUpcomingArtistEventReminders() {
        profileService.notifyUpcomingArtistEventReminders();
    }
}
