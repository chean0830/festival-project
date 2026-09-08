USE festival;

-- 기존 festival DB에 한 번만 실행합니다.
ALTER TABLE member
    ADD COLUMN postal_code VARCHAR(10) NULL AFTER phone_number,
    ADD COLUMN road_address VARCHAR(255) NULL AFTER postal_code,
    ADD COLUMN detail_address VARCHAR(255) NULL AFTER road_address;

