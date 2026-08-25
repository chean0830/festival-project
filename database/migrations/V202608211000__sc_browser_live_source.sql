-- OBS 없이 브라우저 카메라와 WebRTC로 송출할 수 있도록 방송 소스 타입을 추가한다.
ALTER TABLE live_stream
    ADD COLUMN source_type VARCHAR(20) NOT NULL DEFAULT 'BROWSER'
        COMMENT 'BROWSER'
        AFTER thumbnail_url,
    MODIFY COLUMN stream_url VARCHAR(500) NULL;
