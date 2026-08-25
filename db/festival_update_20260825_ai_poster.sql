USE festival;

-- 2026-08-25 페스티벌 기록 - AI(Gemini) 포스터 생성 기능 추가
-- mood 컬럼은 스키마상 있었지만 미사용이었는데, 이번에 실제로 쓰기 시작하면서
-- 자유 입력 문구를 담기엔 30자가 짧아 넉넉하게 늘림
ALTER TABLE festival_record
    MODIFY COLUMN mood VARCHAR(100);

ALTER TABLE festival_record
    ADD COLUMN poster_image_url VARCHAR(500) AFTER mood;
