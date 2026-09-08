USE festival;

-- 기존 festival DB에 한 번만 실행합니다.
-- 아티스트/공연 장르 태깅 데이터. "나의 뱃지" 장르 조건(락 스피릿/힙합 러버/장르 컬렉터)과
-- 프로필 통계(선호 장르)가 이 데이터를 사용한다.
-- genre.name은 UNIQUE라 이미 있는 장르(예: EDM)와 겹치면 원래 INSERT는 실패하므로 IGNORE로 건너뛴다.
-- (그 결과 '락'/'ROCK', '힙합'/'HIPHOP'처럼 같은 의미의 장르가 이름만 다르게 공존할 수 있는데,
--  BadgeService의 GENRE_ALIASES가 대소문자 무시 + 별칭 매칭이라 뱃지 판정에는 영향 없다.)
INSERT IGNORE INTO genre (name) VALUES
('K-POP'), ('J-POP'), ('J-ROCK'), ('ROCK'), ('POP'),
('HIPHOP'), ('R&B'), ('EDM'), ('INDIE'), ('BALLAD');

INSERT IGNORE INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'K-POP'
WHERE a.name IN (
    '태민','아이유','IDID','ATEEZ','ALLDAY PROJECT','CORTIS','KiiiKiii','tripleS',
    'RESCENE','xikers','ALPHA DRIVE ONE','Evan','Yena','CLOSE YOUR EYES','RIIZE',
    'ILLIT','NMIXX','TREASURE'
);

INSERT IGNORE INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'J-POP'
WHERE a.name IN ('Yamada Ryosuke', 'Kaze Fujii', 'XG');

INSERT IGNORE INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'J-ROCK'
WHERE a.name IN ('SPYAIR', 'back number', 'Asian Kung-Fu Generation', 'Sunny Day Service', 'Hi-Standard');

INSERT IGNORE INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'ROCK'
WHERE a.name IN ('넬', 'Devo', 'The Strokes', 'David Byrne', 'Iggy Pop');

INSERT IGNORE INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'POP'
WHERE a.name IN ('Sabrina Carpenter', 'Karol G', 'Justin Bieber', 'Katseye', 'Addison Rae', 'PinkPantheress', 'Laufey');

INSERT IGNORE INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'HIPHOP'
WHERE a.name IN ('Sexyy Red', 'Central Cee', 'Young Thug');

INSERT IGNORE INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'R&B'
WHERE a.name IN ('Teddy Swims', 'FKA Twigs');

INSERT IGNORE INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'EDM'
WHERE a.name IN (
    'DÉ DÉ MOUSE', 'KMNZ', 'LanPage', 'なみぐる+フロクロ', 'Nor', 'PAS TASTA',
    'Synthion', 'Tomggg', 'TEAM TETRAPOD', 'Anyma', 'Disclosure', 'Kaskade',
    'Massive Attack', 'Susumu Hirasawa'
);

INSERT IGNORE INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'INDIE'
WHERE a.name IN ('The xx', 'Ethel Cain', 'Sombr', 'Khruangbin');

INSERT IGNORE INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'BALLAD'
WHERE a.name IN ('임영웅');

INSERT IGNORE INTO event_genre (event_id, genre_id)
SELECT DISTINCT es.event_id, ag.genre_id
FROM event_schedule es
JOIN artist_genre ag ON ag.artist_id = es.artist_id;
