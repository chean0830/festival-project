-- 알림 클릭 시 이동할 프론트 경로. event_id로 화면을 유추할 수 없는 알림
-- (중고거래 채팅 등)에서 알림함 클릭이 해당 화면으로 바로 이동하도록 하기 위함.
ALTER TABLE notification
    ADD COLUMN link_path VARCHAR(255) NULL AFTER content;
