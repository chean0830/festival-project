USE festival;

-- 기존 festival DB에 한 번만 실행합니다.
-- V11(커뮤니티 더미데이터), V14(중고거래/사전예약 결제 테스트 데이터) 등 여러 시드 파일이
-- member_id 3~8번 회원이 이미 존재한다고 가정하고 만들어져 있는데, 이 회원들은 사실 어느
-- 시드 스크립트에도 들어있지 않았다 (다들 각자 로컬에서 회원가입/OAuth 로그인으로
-- 만들어졌던 계정이라 팀원마다 있고 없고가 다르다). 그래서 따로 이 파일로 채워 넣는다.
--
-- 주의: member_id를 고정값으로 넣기 때문에, 로컬 DB에 이미 1~8번 회원이 있다면
-- (본인 계정을 가장 먼저 만들어서 낮은 번호를 차지하고 있는 경우 등) 충돌이 날 수 있다.
-- 그럴 땐 이 스크립트를 그대로 쓰지 말고, 알려주면 본인 환경에 맞게 다시 만들어줄게.
--
-- 1 sample1@example.com(공연러버) / 2 sample2@example.com(페스티벌러) -- 커뮤니티 샘플글 작성자
-- 3 test@example.com(테스트유저) / 4 testuser1@example.com(테스트가입)
-- 5 aaa@naver.com(메롱) / 8 aa@naver.com(이름)
-- (원래 있던 6, 7번은 실제 팀원 개인 계정이라 공유 데이터에서 제외했다.)
--
-- 비밀번호는 이미 암호화(bcrypt)된 값을 그대로 옮긴 것들이라 원문은 알 수 없다.
-- 3번은 원본 데이터 자체가 암호화 안 된 평문("test1234")으로 들어있던 계정이라 그대로
-- 옮겼는데, 실제 로그인은 안 될 수 있다 (FK 채우는 용도로만 쓰고 로그인은 본인 계정으로
-- 하면 된다).

LOCK TABLES `member` WRITE;
-- INSERT IGNORE: 이미 존재하는 번호(로컬에서 직접 가입한 계정 등)는 건너뛴다.
INSERT IGNORE INTO `member` (
    `member_id`, `email`, `password`, `phone_number`, `postal_code`, `road_address`, `detail_address`,
    `nickname`, `profile_image`, `introduction`, `role`, `status`,
    `dark_mode`, `notification_enabled`, `marketing_agree`, `push_enabled`, `email_enabled`,
    `created_at`, `updated_at`
) VALUES
-- 1, 2번은 seed_community_sample_data.sql(커뮤니티 글/댓글)의 작성자로 쓰인다.
(1,'sample1@example.com','sample',NULL,NULL,NULL,NULL,'공연러버',NULL,'공연 후기 자주 남겨요.','USER','ACTIVE',0,1,0,1,1,'2026-08-17 10:00:00','2026-08-17 10:00:00'),
(2,'sample2@example.com','sample',NULL,NULL,NULL,NULL,'페스티벌러',NULL,NULL,'USER','ACTIVE',0,1,0,1,1,'2026-08-17 10:05:00','2026-08-17 10:05:00'),
(3,'test@example.com','test1234',NULL,NULL,NULL,NULL,'테스트유저',NULL,'반가워요, 프로필 미리보기용 테스트 계정입니다.','USER','ACTIVE',0,1,0,1,1,'2026-08-19 15:47:35','2026-08-19 16:29:40'),
(4,'testuser1@example.com','$2a$10$iULHH8yACcu/CZOeGkRuQ.KOBLglHYCWpLJUq206MEh2HPYRzoxoG','01012345678','12345','인천 연수구','101동 101호','테스트가입',NULL,NULL,'USER','ACTIVE',0,1,0,1,1,'2026-08-19 18:42:05','2026-08-19 18:42:05'),
(5,'aaa@naver.com','$2a$10$1M8zyoX/KAJjLa4WlKjhp.YiBl2d42F1bz4A1kkHplXTrpU4ojdiG','01011111111','01067','서울 강북구 한천로 965','111','메롱',NULL,NULL,'USER','ACTIVE',0,1,0,1,1,'2026-08-19 18:50:51','2026-08-19 18:50:51'),
(8,'aa@naver.com','$2a$10$tPyNsOjVaw1ji7LGbh8uVOD2GOwEe5raG3N34CV9b7TCBonYhtIPG','01055555555','13479','경기 성남시 분당구 판교동 577-4','ㅁㅁㅁ','이름',NULL,NULL,'USER','ACTIVE',0,1,0,1,1,'2026-08-20 17:05:47','2026-08-20 17:05:47');
UNLOCK TABLES;
