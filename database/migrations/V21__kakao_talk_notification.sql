USE festival;

-- 카카오톡 알림("나에게 보내기") 기능을 위한 컬럼 추가.
-- member: 유저가 카톡 알림 수신에 동의했는지 여부(마이페이지 토글)
-- social_account: 카카오 로그인 시 발급받은 토큰을 저장해뒀다가, 알림 발생 시점에 그 토큰으로
--                  카카오 "나에게 보내기" API를 호출하기 위함. access_token은 짧게 만료되므로
--                  refresh_token으로 갱신하고 만료 시각을 같이 저장한다.
ALTER TABLE member
    ADD COLUMN kakao_notification_enabled BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE social_account
    ADD COLUMN kakao_access_token VARCHAR(500) NULL,
    ADD COLUMN kakao_refresh_token VARCHAR(500) NULL,
    ADD COLUMN kakao_token_expires_at DATETIME NULL;
