USE festival;

CREATE TABLE IF NOT EXISTS donation (
    donation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stream_id BIGINT NOT NULL,
    donor_id BIGINT NOT NULL,
    amount DECIMAL(10,0) NOT NULL,
    message VARCHAR(200),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        COMMENT 'PENDING, SUCCESS, FAIL',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_donation_stream
        FOREIGN KEY (stream_id) REFERENCES live_stream(stream_id),
    CONSTRAINT fk_donation_donor
        FOREIGN KEY (donor_id) REFERENCES member(member_id),
    INDEX idx_donation_stream_created (stream_id, created_at),
    INDEX idx_donation_donor (donor_id)
);

CREATE TABLE IF NOT EXISTS donation_payment (
    donation_payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donation_id BIGINT NOT NULL,
    toss_order_id VARCHAR(64) NOT NULL UNIQUE,
    payment_key VARCHAR(100) NOT NULL UNIQUE,
    payment_method VARCHAR(30) NOT NULL,
    amount DECIMAL(10,0) NOT NULL,
    status VARCHAR(20) NOT NULL
        COMMENT 'SUCCESS, FAIL, CANCELED',
    paid_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_donation_payment_donation
        FOREIGN KEY (donation_id) REFERENCES donation(donation_id),
    CONSTRAINT uk_donation_payment_donation UNIQUE (donation_id)
);

-- festival.sql로 테이블을 먼저 만든 로컬 DB도 같은 구조로 보정합니다.
SET @add_donation_message = IF(
    EXISTS(
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'donation'
          AND column_name = 'message'
    ),
    'SELECT 1',
    'ALTER TABLE donation ADD COLUMN message VARCHAR(200) NULL AFTER amount'
);
PREPARE add_donation_message_stmt FROM @add_donation_message;
EXECUTE add_donation_message_stmt;
DEALLOCATE PREPARE add_donation_message_stmt;

SET @add_donation_toss_order = IF(
    EXISTS(
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'donation_payment'
          AND column_name = 'toss_order_id'
    ),
    'SELECT 1',
    'ALTER TABLE donation_payment ADD COLUMN toss_order_id VARCHAR(64) NULL AFTER donation_id'
);
PREPARE add_donation_toss_order_stmt FROM @add_donation_toss_order;
EXECUTE add_donation_toss_order_stmt;
DEALLOCATE PREPARE add_donation_toss_order_stmt;

SET @previous_sql_safe_updates = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

UPDATE donation_payment
SET toss_order_id = CONCAT('LEGACY_DONATION_', donation_payment_id)
WHERE toss_order_id IS NULL;

SET SQL_SAFE_UPDATES = @previous_sql_safe_updates;

ALTER TABLE donation_payment
    MODIFY COLUMN toss_order_id VARCHAR(64) NOT NULL;

SET @add_donation_toss_order_unique = IF(
    EXISTS(
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = 'donation_payment'
          AND column_name = 'toss_order_id'
          AND non_unique = 0
    ),
    'SELECT 1',
    'ALTER TABLE donation_payment ADD UNIQUE INDEX uk_donation_payment_toss_order_id (toss_order_id)'
);
PREPARE add_donation_toss_order_unique_stmt FROM @add_donation_toss_order_unique;
EXECUTE add_donation_toss_order_unique_stmt;
DEALLOCATE PREPARE add_donation_toss_order_unique_stmt;

SET @add_donation_payment_donation_unique = IF(
    EXISTS(
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = 'donation_payment'
          AND column_name = 'donation_id'
          AND non_unique = 0
    ),
    'SELECT 1',
    'ALTER TABLE donation_payment ADD UNIQUE INDEX uk_donation_payment_donation (donation_id)'
);
PREPARE add_donation_payment_donation_unique_stmt FROM @add_donation_payment_donation_unique;
EXECUTE add_donation_payment_donation_unique_stmt;
DEALLOCATE PREPARE add_donation_payment_donation_unique_stmt;
