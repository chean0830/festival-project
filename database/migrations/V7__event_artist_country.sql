USE festival;

-- 기존 festival DB에 한 번만 실행합니다.
-- event: 공연장(venue)이 아니라 "출연 아티스트가 어느 나라 출신인지" 구분용.
-- 국내공연/내한공연 분류에 씀 (페스티벌은 기존대로 venue.country로 국내/해외 구분).
-- 기본값 KR(국내 아티스트), 해외 아티스트면 JP/US 등으로 채워넣으면 됨.
ALTER TABLE event
    ADD COLUMN artist_country VARCHAR(2) NOT NULL DEFAULT 'KR' AFTER event_type;
