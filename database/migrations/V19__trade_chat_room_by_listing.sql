USE festival;

-- 채팅방 기준을 "구매요청(UsedTransaction) 1건당 1방"에서 "매물(UsedListing) + 구매자 1쌍당 1방"으로 바꾼다.
-- 이제 구매 요청을 넣기 전에도 매물 상세에서 바로 판매자와 채팅을 시작할 수 있다.
-- transaction_id는 남겨두되 선택 항목이 된다 — 채팅 중 실제 구매 요청이 생기면 그 방에 연결한다.
-- 이미 festival.sql을 통째로 새로 임포트한 사람은 이 마이그레이션을 실행할 필요 없다(중복 컬럼 에러 남).

ALTER TABLE trade_chat_room
    ADD COLUMN listing_id BIGINT NULL COMMENT '채팅 대상 매물',
    ADD COLUMN buyer_id BIGINT NULL COMMENT '채팅을 시작한 구매자(상대는 매물의 판매자)',
    MODIFY COLUMN transaction_id BIGINT NULL COMMENT '채팅 중 구매 요청이 생기면 연결(선택, 더 이상 필수 아님)';

UPDATE trade_chat_room r
    JOIN used_transaction t ON t.transaction_id = r.transaction_id
    SET r.listing_id = t.listing_id, r.buyer_id = t.buyer_id
    WHERE r.transaction_id IS NOT NULL;

-- 예전엔 구매요청 1건당 방 1개였어서, 같은 (매물, 구매자)로 재요청한 적이 있으면 방이 여러 개 남아있을 수 있다.
-- 이런 중복 방은 가장 먼저 생긴 방(대표 방) 하나로 합친다: 메시지를 옮기고, 차단 상태도 옮긴 뒤 나머지는 지운다.
DROP TEMPORARY TABLE IF EXISTS tmp_room_canonical;
CREATE TEMPORARY TABLE tmp_room_canonical AS
SELECT listing_id, buyer_id, MIN(room_id) AS canonical_room_id
FROM trade_chat_room
GROUP BY listing_id, buyer_id;

UPDATE trade_chat_message m
    JOIN trade_chat_room r ON r.room_id = m.room_id
    JOIN tmp_room_canonical c ON c.listing_id = r.listing_id AND c.buyer_id = r.buyer_id
    SET m.room_id = c.canonical_room_id
    WHERE r.room_id <> c.canonical_room_id;

UPDATE trade_chat_room r
    JOIN tmp_room_canonical c ON c.listing_id = r.listing_id AND c.buyer_id = r.buyer_id AND c.canonical_room_id <> r.room_id
    JOIN trade_chat_room canonical ON canonical.room_id = c.canonical_room_id
    SET canonical.blocked = 1, canonical.blocked_by = r.blocked_by
    WHERE r.blocked = 1;

DELETE r FROM trade_chat_room r
    JOIN tmp_room_canonical c ON c.listing_id = r.listing_id AND c.buyer_id = r.buyer_id
    WHERE r.room_id <> c.canonical_room_id;

DROP TEMPORARY TABLE IF EXISTS tmp_room_canonical;

ALTER TABLE trade_chat_room
    MODIFY COLUMN listing_id BIGINT NOT NULL,
    MODIFY COLUMN buyer_id BIGINT NOT NULL,
    ADD UNIQUE KEY uk_trade_chat_room_listing_buyer (listing_id, buyer_id),
    ADD CONSTRAINT fk_trade_chat_room_listing FOREIGN KEY (listing_id) REFERENCES used_listing(listing_id),
    ADD CONSTRAINT fk_trade_chat_room_buyer FOREIGN KEY (buyer_id) REFERENCES member(member_id);
