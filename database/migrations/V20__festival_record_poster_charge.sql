USE festival;

-- 기존 festival DB에 한 번만 실행합니다.
-- AI 포스터 "다시 만들기" 무료 3회를 모두 쓴 뒤, 1회당 900원에 생성 횟수를 충전하는 기능.

-- (회원, 공연) 단위 포스터 충전 횟수. 실제 생성 가능 횟수 = 3(무료) + poster_paid_count.
SET @add_poster_paid_count = IF(
    EXISTS(
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'festival_record_ai_quota'
          AND column_name = 'poster_paid_count'
    ),
    'SELECT 1',
    'ALTER TABLE festival_record_ai_quota ADD COLUMN poster_paid_count INT NOT NULL DEFAULT 0 AFTER diary_used_count'
);
PREPARE add_poster_paid_count_stmt FROM @add_poster_paid_count;
EXECUTE add_poster_paid_count_stmt;
DEALLOCATE PREPARE add_poster_paid_count_stmt;

-- 포스터 생성 1회 충전 결제 내역 (Toss Payments).
CREATE TABLE IF NOT EXISTS poster_charge_payment (
    charge_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    record_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    toss_order_id VARCHAR(64) NOT NULL UNIQUE,
    payment_key VARCHAR(100) NOT NULL UNIQUE,
    payment_method VARCHAR(30) NOT NULL,
    amount DECIMAL(10,0) NOT NULL,
    status VARCHAR(20) NOT NULL
        COMMENT 'SUCCESS, FAIL, CANCELED',
    paid_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_poster_charge_record
        FOREIGN KEY (record_id) REFERENCES festival_record(record_id),
    CONSTRAINT fk_poster_charge_member
        FOREIGN KEY (member_id) REFERENCES member(member_id)
);
