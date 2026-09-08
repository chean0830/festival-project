USE festival;

-- 2026-08-25 AI 일기 생성 - 무료 생성 3회 제한을 festival_record_ai_quota에
-- 컬럼 하나 추가해서 같이 관리 (AI 포스터와 동일하게 (회원, 공연) 단위)
ALTER TABLE festival_record_ai_quota
    ADD COLUMN diary_used_count INT NOT NULL DEFAULT 0 AFTER used_count;
