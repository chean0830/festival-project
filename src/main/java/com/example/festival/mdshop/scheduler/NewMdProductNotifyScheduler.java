package com.example.festival.mdshop.scheduler;

import com.example.festival.mdshop.service.MdShopService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 사전예약 중인 MD 상품의 공연에 출연하는 아티스트를 관심 등록한 회원들에게 신상 MD 알림을 보내는 배치.
 * 서버 기동 직후 한 번 실행하고(테스트/데모에서 바로 확인 가능하도록), 이후 24시간마다 반복한다.
 */
@Component
public class NewMdProductNotifyScheduler {

    private final MdShopService mdShopService;

    public NewMdProductNotifyScheduler(MdShopService mdShopService) {
        this.mdShopService = mdShopService;
    }

    @Scheduled(initialDelay = 0, fixedDelay = 24 * 60 * 60 * 1000)
    public void notifyInterestedArtistFans() {
        mdShopService.notifyInterestedArtistFans();
    }
}
