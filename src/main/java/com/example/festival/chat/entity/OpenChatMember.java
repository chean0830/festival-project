package com.example.festival.chat.entity;

import com.example.festival.member.entity.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * open_chat_member 매핑. 오픈채팅방 참여자 (room_id, member_id) 복합키.
 * 참여는 첫 메시지 전송 시 자동으로 생긴다 (별도 "입장" 액션 없음 — 지금은 채팅 관리 기능 범위만 다룬다).
 * is_blocked: 이 방에서 차단되어 더 이상 메시지를 보낼 수 없는 상태.
 */
@Entity
@Table(name = "open_chat_member")
@IdClass(OpenChatMemberId.class)
@Getter
@NoArgsConstructor
public class OpenChatMember {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private OpenChatRoom room;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    @Column(name = "left_at")
    private LocalDateTime leftAt;

    @Column(name = "is_mute", nullable = false)
    private boolean mute;

    @Column(name = "is_blocked", nullable = false)
    private boolean blocked;

    public OpenChatMember(OpenChatRoom room, Member member) {
        this.room = room;
        this.member = member;
        this.joinedAt = LocalDateTime.now();
        this.mute = false;
        this.blocked = false;
    }

    public boolean isActive() {
        return leftAt == null;
    }

    public void rejoin() {
        this.joinedAt = LocalDateTime.now();
        this.leftAt = null;
    }

    public void leave() {
        this.leftAt = LocalDateTime.now();
    }

    public void block() {
        this.blocked = true;
        if (this.leftAt == null) {
            this.leftAt = LocalDateTime.now();
        }
    }
}
