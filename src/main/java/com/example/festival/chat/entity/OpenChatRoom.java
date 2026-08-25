package com.example.festival.chat.entity;

import com.example.festival.event.entity.Event;
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

/**
 * open_chat_room 매핑. 페스티벌(event)마다 오픈채팅방을 하나씩 둔다.
 */
@Entity
@Table(name = "open_chat_room")
@Getter
@NoArgsConstructor
public class OpenChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    public OpenChatRoom(Event event, String name) {
        this.event = event;
        this.name = name;
    }
}
