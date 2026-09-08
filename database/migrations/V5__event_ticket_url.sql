USE festival;

-- 기존 festival DB에 한 번만 실행합니다.
-- event: 공연 상세페이지에서 "예매하러 가기" 버튼이 연결할 예매 링크 (YES24)
ALTER TABLE event
    ADD COLUMN ticket_url VARCHAR(500) NULL AFTER ticket_open_at;
