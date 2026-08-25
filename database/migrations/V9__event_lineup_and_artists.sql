USE festival;

-- 기존 festival DB에 한 번만 실행합니다.
-- 각 공연(event)에 실제로 출연하는 아티스트 정보를 채우고, event_schedule(라인업)로 연결한다.
-- 콘서트(1,2,3,7,8)는 실제 헤드라이너 1명, 페스티벌(4,5,6,9)은 2026-08-21 기준으로 웹 검색해서
-- 확인한 실제 공지 라인업으로 채웠다.
--   - TETRAPOD'26: dedemouse.com 공식 공지 페이지
--   - 2026 THE FACT MUSIC AWARDS(부산): Soompi 기사
--   - Coachella 2026: Rolling Stone AU / CBS News 기사
--   - Fuji Rock Festival 2026: Japan Times / 공식 사이트
-- 헤드라이너급은 데뷔일/소개/공식 프로필 사진(주로 Wikimedia Commons)까지 채웠고,
-- 서포트 라인업 다수는 이름/타입만 채우고 나머지는 비워뒀다(정보 소스가 부족해서, NULL 허용 컬럼이라 문제 없음).
-- 공연 시간대(performance_start)는 실제 타임테이블이 아니라, 각 공연의 실제 날짜 범위 안에서
-- 보기 좋게 배치한 더미 값이다.

-- ============================================================
-- 1) 기존 아티스트(넬/태민/SPYAIR) 정보 보강 — 프로필 사진은 이미 있어서 그대로 두고
--    데뷔일/소개만 채운다.
-- ============================================================
UPDATE artist SET
    debut_date = '2001-03-01',
    description = '2001년 데뷔한 한국 얼터너티브/사이키델릭 록 밴드. 김종완(보컬/기타/건반), 이재경(리드기타), 이정훈(베이스)으로 구성. "기억을 걷는 시간", "Stay" 등의 곡으로 잘 알려져 있다.'
WHERE name = '넬';

UPDATE artist SET
    debut_date = '2014-08-18',
    description = 'SM엔터테인먼트 소속. 그룹 샤이니 멤버로 2008년 데뷔했고, 2014년 미니앨범 "Ace"로 솔로 데뷔했다. 장르를 넘나드는 실험적인 솔로 음악과 퍼포먼스로 유명하다.'
WHERE name = '태민';

UPDATE artist SET
    debut_date = '2010-08-11',
    description = '2005년 나고야에서 결성된 일본 록 밴드. 2010년 싱글 "Liar"로 메이저 데뷔했다. 멤버는 보컬, 기타, 베이스, 드럼 4인조.'
WHERE name = 'SPYAIR';

-- ============================================================
-- 2) 콘서트(7,8) 헤드라이너 신규 등록
-- ============================================================
INSERT INTO artist (name, artist_type, profile_image, debut_date, description) VALUES
('back number', 'BAND', NULL, '2009-02-18', '2004년 군마현에서 결성된 일본 록 밴드. 시미즈 이요리(보컬/기타), 코지마 카즈야(베이스), 쿠리하라 히사시(드럼) 3인조. "크리스마스 송" 등 발라드 록으로 유명하다.'),
('Yamada Ryosuke', 'SOLO', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Yamada_Ryosuke_%28cropped%29.jpg/250px-Yamada_Ryosuke_%28cropped%29.jpg', '2007-11-14', 'STARTO엔터테인먼트 소속. 그룹 Hey! Say! JUMP 멤버로 2007년 데뷔했으며, 배우로도 활동 중이다.');

-- ============================================================
-- 3) TETRAPOD'26 - Intermingle 라인업 (실제 공지, 2026-09-05 YES24 WANDERLOCH HALL 기준)
-- ============================================================
INSERT INTO artist (name, artist_type) VALUES
('DÉ DÉ MOUSE', 'SOLO'),
('KMNZ', 'GROUP'),
('LanPage', 'SOLO'),
('なみぐる+フロクロ', 'GROUP'),
('Nor', 'SOLO'),
('PAS TASTA', 'GROUP'),
('Synthion', 'SOLO'),
('Tomggg', 'SOLO'),
('TEAM TETRAPOD', 'GROUP');

-- ============================================================
-- 4) 2026 THE FACT MUSIC AWARDS (부산) 라인업 (실제 공지, 3차에 걸쳐 발표됨)
-- ============================================================
INSERT INTO artist (name, artist_type) VALUES
('IDID', 'GROUP'),
('ATEEZ', 'GROUP'),
('ALLDAY PROJECT', 'GROUP'),
('CORTIS', 'GROUP'),
('KiiiKiii', 'GROUP'),
('tripleS', 'GROUP'),
('RESCENE', 'GROUP'),
('xikers', 'GROUP'),
('ALPHA DRIVE ONE', 'GROUP'),
('Evan', 'SOLO'),
('Yena', 'SOLO'),
('CLOSE YOUR EYES', 'GROUP'),
('RIIZE', 'GROUP'),
('ILLIT', 'GROUP'),
('NMIXX', 'GROUP'),
('임영웅', 'SOLO'),
('TREASURE', 'GROUP');

-- ============================================================
-- 5) Coachella 2026 라인업 (실제 공지 — 4/10~12, 헤드라이너: Sabrina Carpenter, Karol G,
--    Justin Bieber, Anyma)
-- ============================================================
INSERT INTO artist (name, artist_type, profile_image, description) VALUES
('Sabrina Carpenter', 'SOLO', 'https://commons.wikimedia.org/wiki/Special:FilePath/Sabrina_Carpenter.jpg', 'Coachella 2026 헤드라이너. 미국 싱어송라이터.'),
('Karol G', 'SOLO', 'https://commons.wikimedia.org/wiki/Special:FilePath/Karol_G_en_2018.jpg', 'Coachella 2026 헤드라이너. 콜롬비아 레게톤/라틴팝 아티스트.'),
('Justin Bieber', 'SOLO', 'https://upload.wikimedia.org/wikipedia/commons/5/58/Justin_Bieber.jpg', 'Coachella 2026 헤드라이너. 캐나다 팝 아티스트.'),
('Anyma', 'SOLO', NULL, 'Coachella 2026 헤드라이너. 이탈리아 출신 전자음악 프로듀서(Tale Of Us 멤버 마테오 밀레리의 솔로 프로젝트).');

INSERT INTO artist (name, artist_type) VALUES
('The xx', 'GROUP'),
('Disclosure', 'GROUP'),
('Ethel Cain', 'SOLO'),
('Teddy Swims', 'SOLO'),
('Katseye', 'GROUP'),
('Devo', 'BAND'),
('Sexyy Red', 'SOLO'),
('Central Cee', 'SOLO'),
('The Strokes', 'BAND'),
('Addison Rae', 'SOLO'),
('Sombr', 'SOLO'),
('David Byrne', 'SOLO'),
('PinkPantheress', 'SOLO'),
('Young Thug', 'SOLO'),
('Kaskade', 'SOLO'),
('Laufey', 'SOLO'),
('Iggy Pop', 'SOLO'),
('FKA Twigs', 'SOLO');

-- ============================================================
-- 6) Fuji Rock Festival 2026 라인업 (실제 공지 — 7/24~26, 데이별 헤드라이너:
--    The xx(1일차), Khruangbin(2일차), Massive Attack(3일차). The xx는 Coachella와 겹치는
--    아티스트라 위에서 이미 등록했으므로 여기서는 다시 만들지 않는다.)
-- ============================================================
INSERT INTO artist (name, artist_type) VALUES
('Khruangbin', 'GROUP'),
('Massive Attack', 'GROUP'),
('Kaze Fujii', 'SOLO'),
('XG', 'GROUP'),
('Asian Kung-Fu Generation', 'BAND'),
('Susumu Hirasawa', 'SOLO'),
('Sunny Day Service', 'BAND'),
('Hi-Standard', 'BAND');

-- ============================================================
-- 7) event_schedule (라인업 연결) — 이름으로 artist_id를 찾아서 연결한다.
-- ============================================================

-- 콘서트: 헤드라이너 1명씩
INSERT INTO event_schedule (event_id, artist_id, performance_start, lineup_order)
SELECT 1, artist_id, '2026-08-29 19:30:00', 1 FROM artist WHERE name = '넬';
INSERT INTO event_schedule (event_id, artist_id, performance_start, lineup_order)
SELECT 2, artist_id, '2026-08-31 19:00:00', 1 FROM artist WHERE name = 'SPYAIR';
INSERT INTO event_schedule (event_id, artist_id, performance_start, lineup_order)
SELECT 3, artist_id, '2026-09-05 19:30:00', 1 FROM artist WHERE name = '태민';
INSERT INTO event_schedule (event_id, artist_id, performance_start, lineup_order)
SELECT 7, artist_id, '2026-09-12 19:00:00', 1 FROM artist WHERE name = 'back number';
INSERT INTO event_schedule (event_id, artist_id, performance_start, lineup_order)
SELECT 8, artist_id, '2026-09-13 19:00:00', 1 FROM artist WHERE name = 'Yamada Ryosuke';

-- TETRAPOD'26 (event_id=4), 2026-08-30
INSERT INTO event_schedule (event_id, artist_id, performance_start, lineup_order)
SELECT 4, artist_id, times.t, times.o FROM artist
JOIN (
    SELECT 'DÉ DÉ MOUSE' AS name, '2026-08-30 14:30:00' AS t, 1 AS o UNION ALL
    SELECT 'KMNZ', '2026-08-30 15:10:00', 2 UNION ALL
    SELECT 'LanPage', '2026-08-30 15:50:00', 3 UNION ALL
    SELECT 'なみぐる+フロクロ', '2026-08-30 16:30:00', 4 UNION ALL
    SELECT 'Nor', '2026-08-30 17:10:00', 5 UNION ALL
    SELECT 'PAS TASTA', '2026-08-30 17:50:00', 6 UNION ALL
    SELECT 'Synthion', '2026-08-30 18:30:00', 7 UNION ALL
    SELECT 'Tomggg', '2026-08-30 19:10:00', 8 UNION ALL
    SELECT 'TEAM TETRAPOD', '2026-08-30 19:50:00', 9
) AS times ON times.name = artist.name;

-- 2026 THE FACT MUSIC AWARDS (event_id=5), 2026-09-06
INSERT INTO event_schedule (event_id, artist_id, performance_start, lineup_order)
SELECT 5, artist_id, times.t, times.o FROM artist
JOIN (
    SELECT 'IDID' AS name, '2026-09-06 17:00:00' AS t, 1 AS o UNION ALL
    SELECT 'ATEEZ', '2026-09-06 17:12:00', 2 UNION ALL
    SELECT 'ALLDAY PROJECT', '2026-09-06 17:24:00', 3 UNION ALL
    SELECT 'CORTIS', '2026-09-06 17:36:00', 4 UNION ALL
    SELECT 'KiiiKiii', '2026-09-06 17:48:00', 5 UNION ALL
    SELECT 'tripleS', '2026-09-06 18:00:00', 6 UNION ALL
    SELECT 'RESCENE', '2026-09-06 18:12:00', 7 UNION ALL
    SELECT 'xikers', '2026-09-06 18:24:00', 8 UNION ALL
    SELECT 'ALPHA DRIVE ONE', '2026-09-06 18:36:00', 9 UNION ALL
    SELECT 'Evan', '2026-09-06 18:48:00', 10 UNION ALL
    SELECT 'Yena', '2026-09-06 19:00:00', 11 UNION ALL
    SELECT 'CLOSE YOUR EYES', '2026-09-06 19:12:00', 12 UNION ALL
    SELECT 'RIIZE', '2026-09-06 19:24:00', 13 UNION ALL
    SELECT 'ILLIT', '2026-09-06 19:36:00', 14 UNION ALL
    SELECT 'NMIXX', '2026-09-06 19:48:00', 15 UNION ALL
    SELECT '임영웅', '2026-09-06 20:00:00', 16 UNION ALL
    SELECT 'TREASURE', '2026-09-06 20:12:00', 17
) AS times ON times.name = artist.name;

-- Coachella 2026 (event_id=6), 2026-04-10 ~ 04-12
INSERT INTO event_schedule (event_id, artist_id, performance_start, lineup_order)
SELECT 6, artist_id, times.t, times.o FROM artist
JOIN (
    SELECT 'Justin Bieber' AS name, '2026-04-10 22:00:00' AS t, 1 AS o UNION ALL
    SELECT 'The xx', '2026-04-10 20:30:00', 2 UNION ALL
    SELECT 'Disclosure', '2026-04-10 19:15:00', 3 UNION ALL
    SELECT 'Ethel Cain', '2026-04-10 18:00:00', 4 UNION ALL
    SELECT 'Teddy Swims', '2026-04-10 16:45:00', 5 UNION ALL
    SELECT 'Katseye', '2026-04-10 15:30:00', 6 UNION ALL
    SELECT 'Devo', '2026-04-10 14:15:00', 7 UNION ALL
    SELECT 'Sexyy Red', '2026-04-10 13:30:00', 8 UNION ALL
    SELECT 'Central Cee', '2026-04-10 12:45:00', 9 UNION ALL
    SELECT 'Sabrina Carpenter', '2026-04-11 22:00:00', 1 UNION ALL
    SELECT 'The Strokes', '2026-04-11 20:30:00', 2 UNION ALL
    SELECT 'Addison Rae', '2026-04-11 19:00:00', 3 UNION ALL
    SELECT 'Sombr', '2026-04-11 17:30:00', 4 UNION ALL
    SELECT 'David Byrne', '2026-04-11 16:00:00', 5 UNION ALL
    SELECT 'PinkPantheress', '2026-04-11 14:30:00', 6 UNION ALL
    SELECT 'Karol G', '2026-04-12 22:00:00', 1 UNION ALL
    SELECT 'Anyma', '2026-04-12 20:30:00', 2 UNION ALL
    SELECT 'Young Thug', '2026-04-12 19:00:00', 3 UNION ALL
    SELECT 'Kaskade', '2026-04-12 17:45:00', 4 UNION ALL
    SELECT 'Laufey', '2026-04-12 16:15:00', 5 UNION ALL
    SELECT 'Iggy Pop', '2026-04-12 15:00:00', 6 UNION ALL
    SELECT 'FKA Twigs', '2026-04-12 13:45:00', 7
) AS times ON times.name = artist.name;

-- Fuji Rock Festival 2026 (event_id=9), 2026-07-24 ~ 07-26
INSERT INTO event_schedule (event_id, artist_id, performance_start, lineup_order)
SELECT 9, artist_id, times.t, times.o FROM artist
JOIN (
    SELECT 'The xx' AS name, '2026-07-24 21:00:00' AS t, 1 AS o UNION ALL
    SELECT 'Kaze Fujii', '2026-07-24 18:30:00', 2 UNION ALL
    SELECT 'XG', '2026-07-24 16:00:00', 3 UNION ALL
    SELECT 'Khruangbin', '2026-07-25 21:00:00', 1 UNION ALL
    SELECT 'Asian Kung-Fu Generation', '2026-07-25 18:30:00', 2 UNION ALL
    SELECT 'Susumu Hirasawa', '2026-07-25 16:00:00', 3 UNION ALL
    SELECT 'Massive Attack', '2026-07-26 21:00:00', 1 UNION ALL
    SELECT 'Sunny Day Service', '2026-07-26 18:30:00', 2 UNION ALL
    SELECT 'Hi-Standard', '2026-07-26 16:00:00', 3
) AS times ON times.name = artist.name;
