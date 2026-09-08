USE festival;

-- 방송 생성 시 0원(무료) 또는 1,000~100,000원(유료)의 입장료를 저장합니다.
SET @add_live_entrance_fee = IF(
    EXISTS(
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'live_stream'
          AND column_name = 'entrance_fee'
    ),
    'SELECT 1',
    'ALTER TABLE live_stream ADD COLUMN entrance_fee DECIMAL(10,0) NOT NULL DEFAULT 0 AFTER end_at'
);
PREPARE add_live_entrance_fee_stmt FROM @add_live_entrance_fee;
EXECUTE add_live_entrance_fee_stmt;
DEALLOCATE PREPARE add_live_entrance_fee_stmt;

CREATE TABLE IF NOT EXISTS live_payment (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stream_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    toss_order_id VARCHAR(64) NOT NULL UNIQUE,
    payment_key VARCHAR(100) NOT NULL UNIQUE,
    payment_method VARCHAR(30) NOT NULL,
    amount DECIMAL(10,0) NOT NULL,
    status VARCHAR(20) NOT NULL
        COMMENT 'SUCCESS, FAIL, CANCELED',
    paid_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_live_payment_stream
        FOREIGN KEY (stream_id) REFERENCES live_stream(stream_id),
    CONSTRAINT fk_live_payment_member
        FOREIGN KEY (member_id) REFERENCES member(member_id),
    CONSTRAINT uk_live_payment_stream_member
        UNIQUE (stream_id, member_id)
);

-- festival.sql의 이전 live_payment 구조로 만든 로컬 DB도 Toss 주문번호를 저장하도록 보정합니다.
SET @add_live_toss_order = IF(
    EXISTS(
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'live_payment'
          AND column_name = 'toss_order_id'
    ),
    'SELECT 1',
    'ALTER TABLE live_payment ADD COLUMN toss_order_id VARCHAR(64) NULL AFTER member_id'
);
PREPARE add_live_toss_order_stmt FROM @add_live_toss_order;
EXECUTE add_live_toss_order_stmt;
DEALLOCATE PREPARE add_live_toss_order_stmt;

SET @previous_sql_safe_updates = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

UPDATE live_payment
SET toss_order_id = CONCAT('LEGACY_LIVE_', payment_id)
WHERE toss_order_id IS NULL;

SET SQL_SAFE_UPDATES = @previous_sql_safe_updates;

ALTER TABLE live_payment
    MODIFY COLUMN toss_order_id VARCHAR(64) NOT NULL;

SET @add_live_toss_order_unique = IF(
    EXISTS(
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = 'live_payment'
          AND column_name = 'toss_order_id'
          AND non_unique = 0
    ),
    'SELECT 1',
    'ALTER TABLE live_payment ADD UNIQUE INDEX uk_live_payment_toss_order_id (toss_order_id)'
);
PREPARE add_live_toss_order_unique_stmt FROM @add_live_toss_order_unique;
EXECUTE add_live_toss_order_unique_stmt;
DEALLOCATE PREPARE add_live_toss_order_unique_stmt;

-- 같은 회원이 같은 방송 입장권을 두 번 갖지 않게 합니다.
SET @add_live_stream_member_unique = IF(
    EXISTS(
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = 'live_payment'
          AND index_name = 'uk_live_payment_stream_member'
          AND non_unique = 0
    ),
    'SELECT 1',
    'ALTER TABLE live_payment ADD UNIQUE INDEX uk_live_payment_stream_member (stream_id, member_id)'
);
PREPARE add_live_stream_member_unique_stmt FROM @add_live_stream_member_unique;
EXECUTE add_live_stream_member_unique_stmt;
DEALLOCATE PREPARE add_live_stream_member_unique_stmt;
