package com.example.festival.notification.entity;

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
 * notification_read 테이블 매핑.
 * 전체 공지(member가 null인 Notification)는 회원 공용 row라 is_read 하나로 회원별 읽음을
 * 표현할 수 없어서, 회원이 전체 공지를 읽으면 이 테이블에 (notification, member) 조합으로 기록한다.
 */
@Entity
@Table(name = "notification_read")
@Getter
@NoArgsConstructor
public class NotificationRead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_id", nullable = false)
    private Notification notification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public NotificationRead(Notification notification, Member member) {
        this.notification = notification;
        this.member = member;
    }
}
