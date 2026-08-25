package com.example.festival.notification.service;

import com.example.festival.event.entity.Event;
import com.example.festival.event.repository.EventRepository;
import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import com.example.festival.notification.dto.NotificationResponse;
import com.example.festival.notification.entity.Notification;
import com.example.festival.notification.entity.NotificationRead;
import com.example.festival.notification.repository.NotificationReadRepository;
import com.example.festival.notification.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 알림 조회/읽음처리 인프라.
 * 알림 생성(notifyMember/notifyAll)은 각 알림을 발생시키는 도메인(AI/추천/MD/중고거래/커뮤니티 등)이
 * 자기 기능을 구현할 때 이 서비스를 주입받아 호출하는 용도로 열어둔 것이며,
 * 지금은 별도 REST 생성 API로는 노출하지 않는다.
 */
@Service
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationReadRepository notificationReadRepository;
    private final MemberRepository memberRepository;
    private final EventRepository eventRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            NotificationReadRepository notificationReadRepository,
            MemberRepository memberRepository,
            EventRepository eventRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.notificationReadRepository = notificationReadRepository;
        this.memberRepository = memberRepository;
        this.eventRepository = eventRepository;
    }

    public List<NotificationResponse> getNotifications(Long memberId) {
        getMemberOrThrow(memberId);
        Set<Long> readBroadcastIds = new HashSet<>(notificationReadRepository.findReadNotificationIdsByMemberId(memberId));
        return notificationRepository.findAllForMember(memberId).stream()
                .map(notification -> toResponse(notification, readBroadcastIds))
                .toList();
    }

    public long getUnreadCount(Long memberId) {
        getMemberOrThrow(memberId);
        return notificationRepository.countUnreadForMember(memberId);
    }

    @Transactional
    public void markAsRead(Long memberId, Long notificationId) {
        getMemberOrThrow(memberId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "알림을 찾을 수 없습니다."));

        Member owner = notification.getMember();
        if (owner == null) {
            // 전체 공지는 알림 row가 회원 공용이라, notification_read에 (알림, 회원) 조합으로 따로 기록한다.
            if (!notificationReadRepository.existsByNotification_NotificationIdAndMember_Id(notificationId, memberId)) {
                Member member = memberRepository.getReferenceById(memberId);
                notificationReadRepository.save(new NotificationRead(notification, member));
            }
            return;
        }
        if (!owner.getId().equals(memberId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "알림을 찾을 수 없습니다.");
        }
        notification.markRead();
    }

    @Transactional
    public void notifyMember(Long memberId, Long eventId, String type, String title, String content) {
        Member member = getMemberOrThrow(memberId);
        Event event = eventId == null ? null : eventRepository.findById(eventId).orElse(null);
        notificationRepository.save(Notification.forMember(member, event, type, title, content));
    }

    @Transactional
    public void notifyAll(String type, String title, String content) {
        notificationRepository.save(Notification.broadcast(type, title, content));
    }

    /**
     * 특정 회원에게 특정 공연 관련 알림(type)을 이미 보낸 적 있는지 확인한다.
     * 배치/스케줄러가 같은 알림을 중복으로 쌓지 않게 막는 용도.
     */
    public boolean hasNotified(Long memberId, Long eventId, String type) {
        return notificationRepository.existsByMember_IdAndEvent_EventIdAndType(memberId, eventId, type);
    }

    private Member getMemberOrThrow(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));
    }

    private NotificationResponse toResponse(Notification notification, Set<Long> readBroadcastIds) {
        boolean read = notification.getMember() != null
                ? notification.isRead()
                : readBroadcastIds.contains(notification.getNotificationId());
        return new NotificationResponse(
                notification.getNotificationId(),
                notification.getType(),
                notification.getTitle(),
                notification.getContent(),
                notification.getEvent() != null ? notification.getEvent().getEventId() : null,
                read,
                notification.getCreatedAt()
        );
    }
}
