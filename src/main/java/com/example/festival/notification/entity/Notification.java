package com.example.festival.notification.entity;

import com.example.festival.event.entity.Event;
import com.example.festival.member.entity.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * notification 테이블 매핑.
 * member가 null이면 전체 공지(모든 회원 대상)라서, is_read는 회원별이 아니라 알림 row 단위로만 존재한다.
 * 그래서 전체 공지는 개별 읽음 처리를 지원하지 않는다 (NotificationService 참고).
 */
@Entity
@Table(name = "notification")
@Getter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @Column(name = "type", nullable = false, length = 30)
    private String type;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", length = 1000)
    private String content;

    /**
     * 알림 클릭 시 이동할 프론트 경로(예: "/shop/used/chat/room/3").
     * event_id로 공연 상세를 유추할 수 없는 알림(중고거래 채팅 등)에서 특정 화면으로 바로 보낼 때 사용.
     */
    @Column(name = "link_path", length = 255)
    private String linkPath;

    @Column(name = "is_read", nullable = false)
    private boolean read;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    private Notification(Member member, Event event, String type, String title, String content, String linkPath) {
        this.member = member;
        this.event = event;
        this.type = type;
        this.title = title;
        this.content = content;
        this.linkPath = linkPath;
        this.read = false;
    }

    public static Notification forMember(Member member, Event event, String type, String title, String content) {
        return new Notification(member, event, type, title, content, null);
    }

    public static Notification forMember(Member member, Event event, String type, String title, String content, String linkPath) {
        return new Notification(member, event, type, title, content, linkPath);
    }

    public static Notification broadcast(String type, String title, String content) {
        return new Notification(null, null, type, title, content, null);
    }

    public void markRead() {
        this.read = true;
    }
}
