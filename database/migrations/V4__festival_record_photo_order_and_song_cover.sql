USE festival;

-- 기존 festival DB에 한 번만 실행합니다.
-- record_image: 사용자가 사진 순서(=대표 사진)를 바꿀 수 있도록 정렬 순서 컬럼 추가
ALTER TABLE record_image
    ADD COLUMN display_order INT NOT NULL DEFAULT 0 AFTER image_url;

-- record_song: 곡 검색 자동완성으로 가져온 앨범 커버 URL 저장
ALTER TABLE record_song
    ADD COLUMN album_cover_url VARCHAR(500) NULL AFTER artist_name;
