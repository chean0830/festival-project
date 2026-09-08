package com.example.festival.chat.entity;

import java.io.Serializable;
import java.util.Objects;

/**
 * open_chat_member 복합키 (room_id, member_id).
 */
public class OpenChatMemberId implements Serializable {

    private Long room;
    private Long member;

    public OpenChatMemberId() {
    }

    public OpenChatMemberId(Long room, Long member) {
        this.room = room;
        this.member = member;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OpenChatMemberId that)) return false;
        return Objects.equals(room, that.room) && Objects.equals(member, that.member);
    }

    @Override
    public int hashCode() {
        return Objects.hash(room, member);
    }
}
