USE festival;

-- 기존 festival DB에 한 번만 실행합니다.
-- "나의 뱃지" 기능(프로필 담당)에서 쓸 뱃지 카탈로그 초기 데이터.
-- condition_type 규약은 BadgeService.java 상단 주석 참고 (VISIT_COUNT / DOMESTIC_COUNT / OVERSEAS_COUNT /
-- GENRE_DIVERSITY / SEASON_COUNT / GENRE_COUNT).
-- name에 UNIQUE 제약이 없어 재실행 시 중복 삽입될 수 있으므로, 이미 있으면 건너뛴다.
INSERT INTO badge (name, description, condition_type, condition_value, badge_image)
SELECT * FROM (SELECT
    '페스티벌 입문자' AS name, '페스티벌 1회 방문' AS description, 'VISIT_COUNT' AS condition_type, '1' AS condition_value, '🎪' AS badge_image
    UNION ALL SELECT '페스티벌 마스터', '페스티벌 5회 방문', 'VISIT_COUNT', '5', '🔥'
    UNION ALL SELECT '락 스피릿', '락/록 장르 페스티벌 3회 방문', 'GENRE_COUNT', '락,3', '🎸'
    UNION ALL SELECT '힙합 러버', '힙합 장르 페스티벌 3회 방문', 'GENRE_COUNT', '힙합,3', '🎤'
    UNION ALL SELECT '여름을 즐기는 자', '여름 페스티벌 3회 방문', 'SEASON_COUNT', 'SUMMER,3', '🌊'
    UNION ALL SELECT 'K-Festival 탐험가', '국내 페스티벌 5회 방문', 'DOMESTIC_COUNT', '5', '🇰🇷'
    UNION ALL SELECT '월드 페스티벌러', '해외 페스티벌 1회 방문', 'OVERSEAS_COUNT', '1', '✈️'
    UNION ALL SELECT '글로벌 페스티벌러', '해외 페스티벌 3회 방문', 'OVERSEAS_COUNT', '3', '🌎'
    UNION ALL SELECT '장르 컬렉터', '서로 다른 장르 5개 이상의 페스티벌 방문', 'GENRE_DIVERSITY', '5', '🎶'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM badge b WHERE b.name = seed.name);
