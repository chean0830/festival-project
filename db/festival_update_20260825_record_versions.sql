USE festival;

-- 2026-08-25 AI 포스터/일기 생성 히스토리를 버전으로 남겨서 갤러리에서 골라 쓸 수 있게 함
-- + ai_summary(한 줄 요약)를 실제로 채우기 시작

CREATE TABLE record_poster_version (
    version_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    record_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    style_request VARCHAR(200),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES festival_record(record_id)
);

CREATE TABLE record_diary_version (
    version_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    record_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(1000),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id) REFERENCES festival_record(record_id)
);
