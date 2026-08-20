package com.example.festival.festivalrecord.scheduler;

import com.example.festival.festivalrecord.service.FestivalRecordService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 다녀온 공연인데 기록을 아직 안 남긴 회원에게 알림을 보내는 배치.
 * 서버 기동 직후 한 번 실행하고(테스트/데모에서 바로 확인 가능하도록), 이후 24시간마다 반복한다.
 */
@Component
public class FestivalRecordReminderScheduler {

    private final FestivalRecordService festivalRecordService;

    public FestivalRecordReminderScheduler(FestivalRecordService festivalRecordService) {
        this.festivalRecordService = festivalRecordService;
    }

    @Scheduled(initialDelay = 0, fixedDelay = 24 * 60 * 60 * 1000)
    public void remindUnrecordedVisits() {
        festivalRecordService.notifyUnrecordedVisits();
    }
}
