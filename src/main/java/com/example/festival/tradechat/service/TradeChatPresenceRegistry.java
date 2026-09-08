package com.example.festival.tradechat.service;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 방별로 "지금 그 채팅방을 열어놓고 있는 회원"을 서버 메모리에서만 추적한다.
 * 재시작하면 초기화되는 게 맞는 성격의 데이터라 DB에는 저장하지 않는다.
 * 프론트가 방 입장 시 enter, 나갈 때(화면 이탈/언마운트) exit을 호출해서 갱신한다.
 */
@Component
public class TradeChatPresenceRegistry {

    private final Map<Long, Set<Long>> onlineMembersByRoom = new ConcurrentHashMap<>();

    /** @return 이번 호출로 새로 온라인 상태가 됐으면 true (이미 온라인이었으면 false) */
    public boolean enter(Long roomId, Long memberId) {
        Set<Long> members = onlineMembersByRoom.computeIfAbsent(roomId, id -> ConcurrentHashMap.newKeySet());
        return members.add(memberId);
    }

    /** @return 이번 호출로 실제로 오프라인이 됐으면 true */
    public boolean exit(Long roomId, Long memberId) {
        Set<Long> members = onlineMembersByRoom.get(roomId);
        if (members == null) {
            return false;
        }
        boolean removed = members.remove(memberId);
        if (members.isEmpty()) {
            onlineMembersByRoom.remove(roomId, members);
        }
        return removed;
    }

    public boolean isOnline(Long roomId, Long memberId) {
        Set<Long> members = onlineMembersByRoom.get(roomId);
        return members != null && members.contains(memberId);
    }
}
