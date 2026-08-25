package com.example.festival.config;

import com.example.festival.chat.redis.ChatRedisPublisher;
import com.example.festival.chat.redis.ChatRedisSubscriber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;

/**
 * 오픈채팅 실시간 브로드캐스트를 여러 서버 인스턴스에 동기화하기 위한 Redis pub/sub 설정.
 * 로컬에 Redis가 없어도 앱 기동에는 영향이 없다 — 리스너 컨테이너를 autoStartup=false로 두고
 * 앱이 완전히 뜬 뒤(ApplicationReadyEvent)에 별도로 시작을 시도하며, 그마저 실패하면
 * 경고만 남기고 넘어간다 (구독이 안 되어도 {@link ChatRedisPublisher}가 로컬 직접 전송으로 대체한다).
 */
@Slf4j
@Configuration
public class RedisConfig {

    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }

    @Bean
    public RedisMessageListenerContainer chatRedisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            ChatRedisSubscriber chatRedisSubscriber
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(chatRedisSubscriber, new ChannelTopic(ChatRedisPublisher.CHANNEL));
        // Redis가 없는 환경에서도 앱이 정상 기동해야 하므로, 컨테이너 자동 시작을 꺼두고
        // 아래 ApplicationReadyEvent 핸들러에서 best-effort로 시작한다.
        container.setAutoStartup(false);
        return container;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void startChatRedisListenerIfAvailable(ApplicationReadyEvent event) {
        // 부트의 Redis 자동 설정도 같은 타입의 빈("redisMessageListenerContainer")을 하나 더 만들어서,
        // 타입으로 조회하면 모호해진다 — 이름으로 정확히 우리 빈만 집어온다.
        RedisMessageListenerContainer container = event.getApplicationContext()
                .getBean("chatRedisMessageListenerContainer", RedisMessageListenerContainer.class);
        try {
            container.start();
            log.info("Redis 채팅 브로드캐스트 구독을 시작했습니다.");
        } catch (Exception e) {
            log.warn("Redis에 연결할 수 없어 채팅 브로드캐스트 구독을 건너뜁니다 "
                    + "(단일 서버에서는 로컬 브로커로 직접 전송되어 채팅은 정상 동작합니다): {}", e.getMessage());
        }
    }
}
