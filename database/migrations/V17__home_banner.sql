USE festival;

-- 기존 festival DB에 한 번만 실행합니다.
-- 홈 화면 큰 배너 이미지를 코드에 박힌 파일이 아니라 DB로 관리하기 위한 테이블.
-- 배너를 바꿀 땐 uploads/banner/ 에 새 이미지 파일을 넣고 image_url만 UPDATE하면
-- 프론트/백엔드 재배포 없이 바로 반영된다.
CREATE TABLE home_banner (
    banner_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO home_banner (image_url) VALUES ('/uploads/banner/banner-b.png');
