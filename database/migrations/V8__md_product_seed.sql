USE festival;

-- 기존 festival DB에 한 번만 실행합니다.
-- MD 사전예약 페이지에서 쓸 초기 상품 데이터. status='PREORDER'인 상품만 사전예약 목록에 노출된다.
-- 재고는 전 상품 100개로 통일.
INSERT INTO md_product (event_id, name, category, description, price, stock, image_url, status, preorder_deadline) VALUES
(1, "NELL'S SEASON 2026 기념 후드티", '의류', 'NELL 콘서트 기념 굿즈 후드티', 59000, 100, 'https://loremflickr.com/400/400/hoodie?lock=1', 'PREORDER', '2026-09-05 23:59:59'),
(6, 'Coachella 2026 캠핑 체어', '굿즈', '코첼라 공식 캠핑 체어', 89000, 100, 'https://loremflickr.com/400/400/camping,chair?lock=2', 'PREORDER', '2026-09-12 23:59:59'),
(9, 'Fuji Rock Festival 2026 스탠딩 배너 세트', '굿즈', '후지록 페스티벌 스탠딩 배너 세트', 32000, 100, 'https://loremflickr.com/400/400/flag,festival?lock=3', 'PREORDER', '2026-08-30 23:59:59'),
(3, 'TAEMIN WORLD TOUR 슬로건 타월', '응원용품', '태민 월드투어 슬로건 타월', 18000, 100, 'https://loremflickr.com/400/400/towel?lock=4', 'PREORDER', '2026-09-01 23:59:59'),
(7, 'back number Tour 어쿠스틱 에코백', '가방', 'back number 투어 기념 에코백', 25000, 100, 'https://loremflickr.com/400/400/totebag?lock=5', 'PREORDER', '2026-09-20 23:59:59'),
(2, 'SPYAIR JUST LIKE THIS 투어 포토카드 세트', '포토카드', 'SPYAIR 투어 기념 포토카드 세트', 15000, 100, 'https://loremflickr.com/400/400/polaroid?lock=6', 'PREORDER', '2026-08-28 23:59:59');
