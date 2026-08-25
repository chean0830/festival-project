-- 기존 live_stream 테이블에 방송 주최자 회원을 연결한다.
-- 기존 데이터가 있을 수 있으므로 컬럼은 NULL 허용으로 추가하고,
-- 새 방송은 애플리케이션에서 반드시 로그인 회원을 주최자로 저장한다.

ALTER TABLE live_stream
    ADD COLUMN host_member_id BIGINT NULL AFTER event_id,
    ADD CONSTRAINT fk_live_stream_host
        FOREIGN KEY (host_member_id) REFERENCES member(member_id);

CREATE INDEX idx_live_stream_host_member_id
    ON live_stream(host_member_id);
