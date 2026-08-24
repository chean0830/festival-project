USE festival;

-- 2026-08-24 팀 변경사항 반영
-- 날씨(공연 날짜 기온/강수확률) 기능이 venue 위경도를 필요로 해서
-- 비어있던 venue.latitude/longitude를 실제 주소 기준으로 채움
UPDATE venue SET latitude=37.5407, longitude=127.0695 WHERE venue_id=1;  -- YES24 LIVE HALL
UPDATE venue SET latitude=37.6688, longitude=126.7449 WHERE venue_id=2;  -- 킨텍스 제2전시장 후면광장
UPDATE venue SET latitude=37.5133, longitude=127.0725 WHERE venue_id=3;  -- 잠실실내체육관
UPDATE venue SET latitude=37.5427, longitude=127.0700 WHERE venue_id=4;  -- 예스24 원더로크홀
UPDATE venue SET latitude=35.1899, longitude=129.0581 WHERE venue_id=5;  -- 부산아시아드주경기장
UPDATE venue SET latitude=33.6803, longitude=-116.2378 WHERE venue_id=6; -- Empire Polo Club
UPDATE venue SET latitude=37.6688, longitude=126.7449 WHERE venue_id=7;  -- 킨텍스 제2전시장 9홀
UPDATE venue SET latitude=37.5585, longitude=127.0072 WHERE venue_id=8;  -- 장충체육관
UPDATE venue SET latitude=36.7967, longitude=138.7975 WHERE venue_id=9;  -- Naeba Ski Resort
