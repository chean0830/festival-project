USE festival;

-- 기존 festival DB에 한 번만 실행합니다.
-- event_news: 뉴스 카드를 클릭하면 이동할 실제 기사 원문 링크
ALTER TABLE event_news
    ADD COLUMN source_url VARCHAR(500) NULL AFTER image_url;
