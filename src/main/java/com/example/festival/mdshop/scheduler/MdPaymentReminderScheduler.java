package com.example.festival.mdshop.scheduler;

import com.example.festival.mdshop.service.MdShopService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 결제 대기(PAYMENT_WAIT) 상태로 일정 시간 이상 방치된 MD 예약에 결제 리마인더를 보내는 배치.
 * 서버 기동 직후 한 번 실행하고(테스트/데모에서 바로 확인 가능하도록), 이후 24시간마다 반복한다.
 */
@Component
public class MdPaymentReminderScheduler {

    private final MdShopService mdShopService;

    public MdPaymentReminderScheduler(MdShopService mdShopService) {
        this.mdShopService = mdShopService;
    }

    @Scheduled(initialDelay = 0, fixedDelay = 24 * 60 * 60 * 1000)
    public void notifyPendingPayments() {
        mdShopService.notifyPendingPayments();
    }
}
