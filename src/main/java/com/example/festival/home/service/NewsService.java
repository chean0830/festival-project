package com.example.festival.home.service;

import com.example.festival.event.entity.Event;
import com.example.festival.event.repository.EventRepository;
import com.example.festival.home.dto.CreateEventNewsRequest;
import com.example.festival.home.dto.NewsSummaryDto;
import com.example.festival.interest.entity.MemberEvent;
import com.example.festival.interest.repository.MemberEventRepository;
import com.example.festival.news.entity.EventNews;
import com.example.festival.news.repository.EventNewsRepository;
import com.example.festival.notification.service.NotificationService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NewsService {

    private static final String NOTIFICATION_TYPE_EVENT_NEWS = "EVENT_NEWS";

    private final EventNewsRepository eventNewsRepository;
    private final EventRepository eventRepository;
    private final MemberEventRepository memberEventRepository;
    private final NotificationService notificationService;
    private final EntityManager entityManager;

    public List<NewsSummaryDto> getRecentNews() {
        return toDtoList(eventNewsRepository.findTop10ByOrderByCreatedAtDesc());
    }

    public List<NewsSummaryDto> getAllNews() {
        return toDtoList(eventNewsRepository.findAllByOrderByCreatedAtDesc());
    }

    public List<NewsSummaryDto> getEventNews(Long eventId) {
        return toDtoList(eventNewsRepository.findByEvent_EventIdOrderByCreatedAtDesc(eventId));
    }

    /**
     * 공연 소식을 등록하고, 이 공연을 관심 등록(찜)한 회원들에게 알림을 보낸다.
     * 전체 공지(notifyAll)가 아니라 관심 등록자에게만 개별 알림(notifyMember)을 보내는 이유:
     * 이 공연과 무관한 회원까지 알림이 가는 걸 막기 위해서다.
     */
    @Transactional
    public NewsSummaryDto createEventNews(Long eventId, CreateEventNewsRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "공연을 찾을 수 없습니다."));

        EventNews news = new EventNews();
        news.setEvent(event);
        news.setTitle(request.title());
        news.setContent(request.content());
        news.setNewsType(request.newsType());
        news.setImageUrl(request.imageUrl());
        news.setSourceUrl(request.sourceUrl());
        news = eventNewsRepository.save(news);
        // created_at은 DB 기본값(트리거)으로 채워져서 insert 직후엔 엔티티에 안 실려있다. DB에서 다시 읽어온다.
        entityManager.flush();
        entityManager.refresh(news);

        for (MemberEvent memberEvent : memberEventRepository.findAllByEventIdWithMember(eventId)) {
            notificationService.notifyMember(
                    memberEvent.getMember().getId(),
                    eventId,
                    NOTIFICATION_TYPE_EVENT_NEWS,
                    "관심 공연 소식이 있어요",
                    event.getName() + " - " + request.title()
            );
        }

        return toDto(news);
    }

    private List<NewsSummaryDto> toDtoList(List<EventNews> newsList) {
        return newsList.stream()
                .map(this::toDto)
                .toList();
    }

    private NewsSummaryDto toDto(EventNews news) {
        Event event = news.getEvent();
        return new NewsSummaryDto(
                news.getNewsId(),
                news.getTitle(),
                news.getImageUrl(),
                news.getSourceUrl(),
                news.getNewsType(),
                news.getCreatedAt(),
                event != null ? event.getEventId() : null,
                event != null ? event.getName() : null
        );
    }
}
