USE festival;

-- trade_chat_room/trade_chat_message는 이미 festival.sql에 최소 형태로 있었는데,
-- 실시간 채팅 기능(차단, 이미지 메시지)을 붙이면서 컬럼을 추가한다.
-- 이미 festival.sql을 통째로 새로 임포트한 사람은 이 마이그레이션을 실행할 필요 없다(중복 컬럼 에러 남).

ALTER TABLE trade_chat_room
    ADD COLUMN blocked BOOLEAN NOT NULL DEFAULT FALSE COMMENT '둘 중 한쪽이 차단하면 true, 양방향 송수신 금지',
    ADD COLUMN blocked_by BIGINT NULL COMMENT '차단을 건 회원',
    ADD CONSTRAINT fk_trade_chat_room_blocked_by FOREIGN KEY (blocked_by) REFERENCES member(member_id),
    ADD UNIQUE KEY uk_trade_chat_room_transaction (transaction_id);

ALTER TABLE trade_chat_message
    ADD COLUMN message_type VARCHAR(20) NOT NULL DEFAULT 'TEXT' COMMENT 'TEXT, IMAGE' AFTER sender_id;
