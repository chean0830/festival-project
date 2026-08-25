USE festival;

-- 기존 festival DB에 한 번만 실행합니다.
-- 먼저 V15__shared_test_members.sql부터 실행해서 member_id 3,4,5,8번이 있어야 합니다.
-- MD 중고거래(usedtrade) + MD 사전예약(mdshop) 결제 기능 테스트용 더미 데이터.
-- md_product는 이미 V8__md_product_seed.sql로 들어가 있어서 여기서는 다시 넣지 않는다.
--
-- 주의: status가 PAID인 행(md_order 104, used_transaction 104)은 화면 표시용 가짜
-- 결제 기록이라, "취소" 버튼을 누르면 실제 Toss Payments 서버에 취소를 요청하다가
-- (paymentKey가 진짜가 아니라서) 에러가 납니다. 실제 결제/환불 흐름은 PAYMENT_WAIT /
-- APPROVED 상태의 행에서 직접 결제 버튼을 눌러 테스트해주세요.

-- ============================================================
-- MD 중고거래 - 매물 (used_listing)
-- ============================================================

LOCK TABLES `used_listing` WRITE;
INSERT INTO `used_listing` (`listing_id`, `seller_id`, `category`, `tags`, `title`, `description`, `price`, `condition`, `trade_method`, `region`, `image_url`, `status`, `created_at`, `updated_at`) VALUES
(1,3,'CLOTHING','#극동아시아타이거즈 #반팔티 #밴드굿즈','극동아시아타이거즈 김치전 호랑이 반팔티','엘리메노 콜라보 티셔츠, 몇 번 안 입었어요.',25000,'사용감 적음','택배','서울 마포구','https://image.msscdn.net/thumbnails/images/goods_img/20250506/5088233/5088233_17465127220444_big.jpg?w=1200','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(2,4,'CLOTHING','#마이케미컬로맨스 #MCR #밴드티','마이케미컬로맨스 Kobra Kid 티셔츠 M','더블랙퍼레이드 투어 굿즈, 상태 좋습니다.',22000,'사용감 적음','택배','경기 성남시','https://skymage.tdalunar.com/v1/al/lu/mychemicalromanceshop.com/media/412/conversions/45bb918d-521b-4e82-9332-96f5917c2fd4-small.png','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(3,3,'CLOTHING','#ACDC #밴드티 #투어굿즈','AC/DC Vancouver PWR UP 투어 티셔츠','내한 공연 아니라 직구했어요, 사이즈 L.',35000,'사용감 적음','택배','서울 마포구','https://store.acdc.com/cdn/shop/files/X3CTAC1661.jpg?v=1786647415&width=533','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(4,4,'CLOTHING','#메탈리카 #Metallica #밴드티','메탈리카 Screaming Skull 티셔츠','해외 직구, 몇 번 세탁했습니다.',28000,'사용감 있음','택배','인천 연수구','https://skymage.tdalunar.com/v1/al/lu/metallica-merch.com/media/991/conversions/0d24d744-54b8-404d-a0ea-fa6936a09e9f-small.png','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(5,3,'CLOTHING','#더워닝 #TheWarning #후디','더 워닝 Ritual 후디','공식 스토어 직구, 사이즈 M.',60000,'사용감 적음','택배','서울 마포구','https://thewarningband.com/cdn/shop/files/PRODUCT_WARNING_26_ECOMM_SK_RITUAL_HOODIE_FRONT.png?v=1784307996&width=1000','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(6,4,'CLOTHING','#그린데이 #GreenDay #밴드티','그린데이 1000 Hours 티셔츠','내한공연 현장 구매, 새상품이에요.',26000,'새상품','직거래','경기 성남시','https://store.greenday.com/cdn/shop/files/26GD071_D.png?v=1786472583&width=533','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(7,3,'ALBUM','#실리카겔 #SilicaGel #CD','실리카겔 SiO2.nH2O CD','재발매반, 미개봉 새상품입니다.',9000,'새상품','택배','서울 마포구','https://image.yes24.com/goods/56018207/XL','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(8,4,'ALBUM','#혁오 #Hyukoh #CD','혁오 1집 23 CD','재발매반, 디지팩 상태 좋아요.',14000,'사용감 적음','택배','경기 성남시','https://image.yes24.com/goods/89405990/XL','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(9,3,'ALBUM','#술탄오브더디스코 #CD','술탄오브더디스코 Easy Listening For Love','개봉만 하고 잘 안 들어서 판매해요.',8000,'사용감 적음','택배','서울 마포구','https://image.yes24.com/goods/74027566/XL','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(10,4,'CHARACTER_GOODS','#더픽스 #THEFIX #포토카드','더 픽스 RUSH 싱글 재킷 포토카드','데뷔싱글 재킷 포토카드, 미사용입니다.',5000,'새상품','직거래','인천 연수구','https://image.bugsm.co.kr/album/images/200/40818/4081827.jpg?version=20250213115109','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(11,3,'ALBUM','#김승주 #소년만화 #CD','김승주 소년만화上 CD','싸인 없는 일반반입니다.',10000,'새상품','택배','서울 마포구','https://image.bugsm.co.kr/album/images/200/205422/20542241.jpg?version=20230127120000','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(12,4,'ALBUM','#쏜애플 #THORNAPPLE #CD','쏜애플 EP 동물 CD','북클릿 상태 양호합니다.',7000,'사용감 적음','택배','경기 성남시','https://image.yes24.com/Goods/121824360/XL','SOLD','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(13,3,'ALBUM','#유다빈밴드 #YdBB #CD','유다빈밴드 1집 CD','싸인 없는 정식 발매반이에요.',10000,'새상품','택배','서울 마포구','https://image.yes24.com/goods/106560500/XL','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(14,4,'ALBUM','#솔루션스 #THESOLUTIONS #LP','솔루션스 THE SOLUTIONS LP','초판 한정반, 상태 좋습니다.',38000,'사용감 적음','택배','경기 성남시','https://media.ktown4u.com/products/resize/thumbnail/2026/01/02/hBW3NT.jpg','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(15,3,'ALBUM','#즛토마요 #ZUTOMAYO #CD','즛토마요 今は今で誓いは笑みで CD','일본 직구반입니다, 새상품.',22000,'새상품','택배','서울 마포구','https://image.yes24.com/momo/TopCate0010/hani/L_1072345.jpg','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(16,4,'ALBUM','#키라라 #KIRARA #CD','키라라 2집 Moves CD','절판반이라 귀해요, 상태 좋습니다.',15000,'사용감 적음','직거래','인천 연수구','https://image.yes24.com/momo/TopCate706/MidCate001/70500645.jpg','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(17,3,'FASHION_GOODS','#카디 #KARDI #볼캡','카디 I ❤︎ KD 볼캡','공식 굿즈샵 구매, 사용감 적어요.',28000,'사용감 적음','택배','서울 마포구','https://www.goodduckshop.com/web/product/big/202607/a917b268e3df1118c04807adc1a765f9.png','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(18,4,'CHARACTER_GOODS','#카디 #KARDI #키링','카디 로고 키링','미사용 새상품입니다.',10000,'새상품','직거래','경기 성남시','https://www.goodduckshop.com/web/product/big/202607/b03c091ad657ffc2719ce17efc13b19f.png','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(19,3,'ACCESSORY','#그린데이 #GreenDay #배지','그린데이 2024 버튼 배지팩','해외 직구, 미개봉입니다.',9000,'새상품','택배','서울 마포구','https://store.greenday.com/cdn/shop/files/2024ButtonPack-24GD289_B.png?v=1728073424&width=533','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27'),
(20,4,'POSTER_PRINT','#ACDC #포스터','AC/DC Vancouver PWR UP 투어 포스터','롤 포장으로 보관, 접힘 없어요.',30000,'새상품','택배','경기 성남시','https://store.acdc.com/cdn/shop/files/X3APAC79.jpg?v=1786647489&width=533','ON_SALE','2026-08-24 11:05:27','2026-08-24 11:05:27');
UNLOCK TABLES;

-- ============================================================
-- MD 중고거래 - 구매 요청/거래 (used_transaction)
-- 101: REQUEST(승인 대기) / 102: APPROVED(결제하기 테스트용) / 103: CANCELED / 104: PAID(거래완료 테스트용, 결제는 가짜)
-- ============================================================

LOCK TABLES `used_transaction` WRITE;
INSERT INTO `used_transaction` (`transaction_id`, `listing_id`, `buyer_id`, `price`, `status`, `created_at`, `completed_at`) VALUES
(101,3,5,35000,'REQUEST','2026-08-25 09:00:00',NULL),
(102,8,3,14000,'APPROVED','2026-08-25 09:10:00',NULL),
(103,17,8,28000,'CANCELED','2026-08-25 09:20:00',NULL),
(104,18,8,10000,'PAID','2026-08-25 09:30:00',NULL);
UNLOCK TABLES;

LOCK TABLES `used_listing` WRITE;
UPDATE `used_listing` SET `status` = 'RESERVED' WHERE `listing_id` IN (8, 18);
UNLOCK TABLES;

LOCK TABLES `used_transaction_payment` WRITE;
INSERT INTO `used_transaction_payment` (`payment_id`, `transaction_id`, `toss_order_id`, `payment_key`, `payment_method`, `amount`, `status`, `paid_at`, `created_at`) VALUES
(101,104,'USED_104_SEEDDEMO','seed_demo_payment_key_used_104','토스페이',10000,'SUCCESS','2026-08-25 09:31:00','2026-08-25 09:31:00');
UNLOCK TABLES;

-- ============================================================
-- MD 사전예약 - 주문 (md_order)
-- 101,102: PAYMENT_WAIT(결제 버튼 테스트용) / 103: CANCELED / 104: PAID(취소 버튼은 가짜 결제라 에러남)
-- ============================================================

LOCK TABLES `md_order` WRITE;
INSERT INTO `md_order` (`order_id`, `product_id`, `member_id`, `order_number`, `quantity`, `total_price`, `shipping_name`, `shipping_address`, `shipping_phone`, `status`, `created_at`, `updated_at`) VALUES
(101,2,4,'MD20260825TESTA01',1,89000,'테스트가입','(13494) 경기 성남시 분당구 판교역로 1 101동 101호','010-2222-3333','PAYMENT_WAIT','2026-08-25 09:00:00','2026-08-25 09:00:00'),
(102,5,5,'MD20260825TESTA02',2,50000,'메롱','(04524) 서울 중구 세종대로 1 202동 202호','010-3333-4444','PAYMENT_WAIT','2026-08-25 09:05:00','2026-08-25 09:05:00'),
(103,3,3,'MD20260825TESTA03',1,32000,'테스트유저','(48058) 부산 해운대구 센텀중앙로 1 303동 303호','010-4444-5555','CANCELED','2026-08-25 09:10:00','2026-08-25 09:15:00'),
(104,4,8,'MD20260825TESTA04',1,18000,'이름','(21999) 인천 연수구 컨벤시아대로 1 404동 404호','010-5555-6666','PAID','2026-08-25 09:20:00','2026-08-25 09:21:00');
UNLOCK TABLES;

LOCK TABLES `payment` WRITE;
INSERT INTO `payment` (`payment_id`, `order_id`, `toss_order_id`, `payment_key`, `payment_method`, `amount`, `status`, `paid_at`, `created_at`) VALUES
(101,104,'MD_104_SEEDDEMO','seed_demo_payment_key_md_104','카드',18000,'SUCCESS','2026-08-25 09:21:00','2026-08-25 09:21:00');
UNLOCK TABLES;
