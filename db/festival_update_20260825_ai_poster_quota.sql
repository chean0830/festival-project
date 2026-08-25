USE festival;

-- 2026-08-25 페스티벌 기록 - AI 포스터 무료 생성 횟수를 (회원, 공연) 단위로 이관
-- 기존엔 festival_record.ai_regenerated_count(기록 단위)로 셌는데, 이러면 기록을
-- 삭제하고 같은 공연으로 새 기록을 만들 때마다 무료 횟수가 초기화되는 문제가 있었음.
-- 같은 공연이면 여러 번 삭제/재작성해도 무료 3회를 넘길 수 없도록 별도 테이블로 관리.

CREATE TABLE festival_record_ai_quota (
    quota_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    used_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (member_id, event_id),
    FOREIGN KEY (member_id) REFERENCES member(member_id),
    FOREIGN KEY (event_id) REFERENCES event(event_id)
);

-- 기존에 이미 써온 만큼은 새 테이블로 이관해서 무료 횟수 초기화를 막는다.
INSERT INTO festival_record_ai_quota (member_id, event_id, used_count)
SELECT member_id, event_id, MAX(ai_regenerated_count)
FROM festival_record
WHERE ai_regenerated_count > 0
GROUP BY member_id, event_id;

ALTER TABLE festival_record
    DROP COLUMN ai_regenerated_count;
