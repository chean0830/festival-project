USE festival;

-- 기존 festival DB에 한 번만 실행합니다.
ALTER TABLE member
    ADD COLUMN phone_number VARCHAR(20) NULL UNIQUE AFTER password;

CREATE TABLE password_reset_token (
    password_reset_token_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_password_reset_token_member
        FOREIGN KEY (member_id)
        REFERENCES member(member_id)
        ON DELETE CASCADE
);

