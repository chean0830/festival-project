package com.example.festival.profile.scheduler;

import com.example.festival.profile.service.ProfileService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * "예정된 공연"(PLANNED)으로 등록해둔 공연이 끝나면 자동으로 "다녀온 공연"에 추가하는 배치.
 * 서버 기동 직후 한 번 실행하고(테스트/데모에서 바로 확인 가능하도록), 이후 24시간마다 반복한다.
 */
@Component
public class PlannedEventAutoAttendScheduler {

    private final ProfileService profileService;

    public PlannedEventAutoAttendScheduler(ProfileService profileService) {
        this.profileService = profileService;
    }

    @Scheduled(initialDelay = 0, fixedDelay = 24 * 60 * 60 * 1000)
    public void autoAttendEndedPlannedEvents() {
        profileService.autoAttendEndedPlannedEvents();
    }
}
