USE festival;

-- 2026-08-25 MD 사전예약 / MD 중고거래 결제 시스템 추가 (Toss Payments)
-- payment 테이블에 Toss 문자열 주문번호 컬럼 추가
ALTER TABLE payment
    ADD COLUMN toss_order_id VARCHAR(64) NOT NULL UNIQUE AFTER order_id;

-- 중고거래 구매 요청 상태에 결제 완료(PAID) 단계 추가 (APPROVED -> PAID -> COMPLETED)
ALTER TABLE used_transaction
    MODIFY COLUMN status VARCHAR(20) NOT NULL
        COMMENT 'REQUEST, APPROVED, PAID, COMPLETED, CANCELED';

-- 중고거래 결제 기록 테이블 신규 생성
CREATE TABLE used_transaction_payment (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT NOT NULL,
    toss_order_id VARCHAR(64) NOT NULL UNIQUE,
    payment_key VARCHAR(100) NOT NULL UNIQUE,
    payment_method VARCHAR(30) NOT NULL,
    amount DECIMAL(10,0) NOT NULL,
    status VARCHAR(20) NOT NULL COMMENT 'SUCCESS, FAIL, CANCELED',
    paid_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES used_transaction(transaction_id)
);
