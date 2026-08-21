USE festival;

-- 기존 festival DB에 한 번만 실행합니다.
-- 장르 종류(genre)를 채우고, 지금 있는 아티스트 62명을 각자 장르로 태깅(artist_genre)한 다음,
-- 공연(event)의 장르는 그 공연 라인업(event_schedule)에 들어간 아티스트들의 장르를 그대로 모아서
-- 자동으로 채운다 (콘서트는 헤드라이너 1명 장르, 페스티벌은 라인업에 있는 여러 장르가 다 들어감).

-- ============================================================
-- 1) 장르 종류
-- ============================================================
INSERT INTO genre (name) VALUES
('K-POP'), ('J-POP'), ('J-ROCK'), ('ROCK'), ('POP'),
('HIPHOP'), ('R&B'), ('EDM'), ('INDIE'), ('BALLAD');

-- ============================================================
-- 2) 아티스트별 장르 태깅
-- ============================================================
INSERT INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'K-POP'
WHERE a.name IN (
    '태민','아이유','IDID','ATEEZ','ALLDAY PROJECT','CORTIS','KiiiKiii','tripleS',
    'RESCENE','xikers','ALPHA DRIVE ONE','Evan','Yena','CLOSE YOUR EYES','RIIZE',
    'ILLIT','NMIXX','TREASURE'
);

INSERT INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'J-POP'
WHERE a.name IN ('Yamada Ryosuke', 'Kaze Fujii', 'XG');

INSERT INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'J-ROCK'
WHERE a.name IN ('SPYAIR', 'back number', 'Asian Kung-Fu Generation', 'Sunny Day Service', 'Hi-Standard');

INSERT INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'ROCK'
WHERE a.name IN ('넬', 'Devo', 'The Strokes', 'David Byrne', 'Iggy Pop');

INSERT INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'POP'
WHERE a.name IN ('Sabrina Carpenter', 'Karol G', 'Justin Bieber', 'Katseye', 'Addison Rae', 'PinkPantheress', 'Laufey');

INSERT INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'HIPHOP'
WHERE a.name IN ('Sexyy Red', 'Central Cee', 'Young Thug');

INSERT INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'R&B'
WHERE a.name IN ('Teddy Swims', 'FKA Twigs');

INSERT INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'EDM'
WHERE a.name IN (
    'DÉ DÉ MOUSE', 'KMNZ', 'LanPage', 'なみぐる+フロクロ', 'Nor', 'PAS TASTA',
    'Synthion', 'Tomggg', 'TEAM TETRAPOD', 'Anyma', 'Disclosure', 'Kaskade',
    'Massive Attack', 'Susumu Hirasawa'
);

INSERT INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'INDIE'
WHERE a.name IN ('The xx', 'Ethel Cain', 'Sombr', 'Khruangbin');

INSERT INTO artist_genre (artist_id, genre_id)
SELECT a.artist_id, g.genre_id FROM artist a JOIN genre g ON g.name = 'BALLAD'
WHERE a.name IN ('임영웅');

-- ============================================================
-- 3) 공연 장르 = 그 공연 라인업(event_schedule)에 있는 아티스트들의 장르를 중복 없이 모음
-- ============================================================
INSERT IGNORE INTO event_genre (event_id, genre_id)
SELECT DISTINCT es.event_id, ag.genre_id
FROM event_schedule es
JOIN artist_genre ag ON ag.artist_id = es.artist_id;
