-- 회원별 YouTube OAuth 연결 정보
-- refresh_token_encrypted에는 AES-GCM으로 암호화된 refresh token만 저장된다.

CREATE TABLE youtube_connection (
    youtube_connection_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL UNIQUE,
    channel_id VARCHAR(100) NOT NULL,
    channel_title VARCHAR(200) NOT NULL,
    refresh_token_encrypted VARCHAR(2000) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_youtube_connection_member
        FOREIGN KEY (member_id) REFERENCES member(member_id)
        ON DELETE CASCADE
);
