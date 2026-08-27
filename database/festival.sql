USE festival;

-- ============================================================
-- Festival Platform
-- Final ERD for Development
-- MySQL / ERDCloud Import
--
-- 기능 명세 기준:
-- 석철 : 소셜로그인 / 설정 / 라이브 스트리밍
-- 채은 : 프로필 / 공연기록 / AI / 추천 / 알림 / MD / 중고거래
-- 승희 : 홈 / 커뮤니티 / 공연일정 / GPS / 방문기록 / 오픈채팅
-- ============================================================


-- ============================================================
-- 1. MEMBER
-- 회원 + 개인 설정 + 알림 설정 통합
-- ============================================================

CREATE TABLE member (
    member_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),

    phone_number VARCHAR(20) UNIQUE,

    postal_code VARCHAR(10),
    road_address VARCHAR(255),
    detail_address VARCHAR(255),

    nickname VARCHAR(50) NOT NULL UNIQUE,
    profile_image VARCHAR(500),
    introduction VARCHAR(500),

    role VARCHAR(20) NOT NULL DEFAULT 'USER'
        COMMENT 'USER, ADMIN',

    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        COMMENT 'ACTIVE, SUSPENDED, WITHDRAWN',

    dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
    notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    marketing_agree BOOLEAN NOT NULL DEFAULT FALSE,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- ============================================================
-- 2. SOCIAL ACCOUNT
-- Google / Kakao / Naver OAuth
-- ============================================================

CREATE TABLE social_account (
    social_account_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    member_id BIGINT NOT NULL,

    provider VARCHAR(20) NOT NULL
        COMMENT 'GOOGLE, KAKAO, NAVER',

    provider_id VARCHAR(255) NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (member_id)
        REFERENCES member(member_id),

    UNIQUE (provider, provider_id)
);


-- ============================================================
-- 2-2. PASSWORD RESET TOKEN
-- 비밀번호 재설정용 1회성 토큰
-- ============================================================

CREATE TABLE password_reset_token (
    password_reset_token_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    member_id BIGINT NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (member_id)
        REFERENCES member(member_id)
        ON DELETE CASCADE
);


-- ============================================================
-- 3. VENUE
-- 공연 장소
-- ============================================================

CREATE TABLE venue (
    venue_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(200) NOT NULL,
    address VARCHAR(300),

    country VARCHAR(2) NOT NULL DEFAULT 'KR'
        COMMENT 'ISO 3166-1 alpha-2 국가 코드. 국내/해외 뱃지 판별에 사용 (예: KR, US, JP)',

    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    capacity INT,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 4. ARTIST
-- 아티스트
-- ============================================================

CREATE TABLE artist (
    artist_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    artist_type VARCHAR(20)
        COMMENT 'SOLO, GROUP, BAND',

    profile_image VARCHAR(500),

    debut_date DATE,

    description TEXT,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- ============================================================
-- 5. GENRE
-- 장르
-- ============================================================

CREATE TABLE genre (
    genre_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(50) NOT NULL UNIQUE
);


-- ============================================================
-- 6. ARTIST GENRE
-- 아티스트 장르
-- ============================================================

CREATE TABLE artist_genre (
    artist_id BIGINT NOT NULL,
    genre_id BIGINT NOT NULL,

    PRIMARY KEY (artist_id, genre_id),

    FOREIGN KEY (artist_id)
        REFERENCES artist(artist_id),

    FOREIGN KEY (genre_id)
        REFERENCES genre(genre_id)
);


-- ============================================================
-- 7. EVENT
-- 페스티벌 / 콘서트
-- ============================================================

CREATE TABLE event (
    event_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    venue_id BIGINT NOT NULL,

    event_type VARCHAR(20) NOT NULL
        COMMENT 'FESTIVAL, CONCERT',

    artist_country VARCHAR(2) NOT NULL DEFAULT 'KR'
        COMMENT '출연 아티스트 국적 (venue.country와 별개, 국내공연/내한공연 구분용)',

    name VARCHAR(200) NOT NULL,
    description TEXT,
    poster_image VARCHAR(500),

    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    ticket_open_at DATETIME,
    ticket_url VARCHAR(500)
        COMMENT '예매 링크 (YES24)',

    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING'
        COMMENT 'UPCOMING, ONGOING, ENDED, CANCELED',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (venue_id)
        REFERENCES venue(venue_id)
);


-- ============================================================
-- 8. EVENT GENRE
-- 공연 장르
-- ============================================================

CREATE TABLE event_genre (
    event_id BIGINT NOT NULL,
    genre_id BIGINT NOT NULL,

    PRIMARY KEY (event_id, genre_id),

    FOREIGN KEY (event_id)
        REFERENCES event(event_id),

    FOREIGN KEY (genre_id)
        REFERENCES genre(genre_id)
);


-- ============================================================
-- 9. EVENT SCHEDULE
-- 공연별 아티스트 / 무대 / 시간 / 순서
--
-- 기존 event_artist를 제거하고 이 테이블에서 통합 관리
-- ============================================================

CREATE TABLE event_schedule (
    schedule_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    event_id BIGINT NOT NULL,
    artist_id BIGINT NOT NULL,

    stage_name VARCHAR(100),

    performance_start DATETIME NOT NULL,
    performance_end DATETIME,

    lineup_order INT,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id)
        REFERENCES event(event_id),

    FOREIGN KEY (artist_id)
        REFERENCES artist(artist_id)
);


-- ============================================================
-- 10. MEMBER ARTIST
-- 관심 아티스트
-- ============================================================

CREATE TABLE member_artist (
    member_artist_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    member_id BIGINT NOT NULL,
    artist_id BIGINT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (member_id)
        REFERENCES member(member_id),

    FOREIGN KEY (artist_id)
        REFERENCES artist(artist_id),

    UNIQUE (member_id, artist_id)
);


-- ============================================================
-- 11. MEMBER GENRE
-- 관심 장르
-- ============================================================

CREATE TABLE member_genre (
    member_id BIGINT NOT NULL,
    genre_id BIGINT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (member_id, genre_id),

    FOREIGN KEY (member_id)
        REFERENCES member(member_id),

    FOREIGN KEY (genre_id)
        REFERENCES genre(genre_id)
);


-- ============================================================
-- 12. MEMBER EVENT
-- 관심 공연 / 예정된 공연
-- ============================================================

CREATE TABLE member_event (
    member_event_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    member_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,

    status VARCHAR(20) NOT NULL
        COMMENT 'INTERESTED, PLANNED',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (member_id)
        REFERENCES member(member_id),

    FOREIGN KEY (event_id)
        REFERENCES event(event_id),

    UNIQUE (member_id, event_id)
);


-- ============================================================
-- 13. EVENT VISIT
-- GPS 방문 인증 + 방문 기록 + 스탬프
-- ============================================================

CREATE TABLE event_visit (
    visit_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    member_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,

    visited_at DATETIME NOT NULL,

    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),

    verified BOOLEAN NOT NULL DEFAULT FALSE,

    stamp_acquired BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (member_id)
        REFERENCES member(member_id),

    FOREIGN KEY (event_id)
        REFERENCES event(event_id)
);


-- ============================================================
-- 14. BADGE
-- ============================================================

CREATE TABLE badge (
    badge_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),

    condition_type VARCHAR(50),
    condition_value VARCHAR(100),

    badge_image VARCHAR(500),

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 15. MEMBER BADGE
-- ============================================================

CREATE TABLE member_badge (
    member_badge_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    member_id BIGINT NOT NULL,
    badge_id BIGINT NOT NULL,

    acquired_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (member_id)
        REFERENCES member(member_id),

    FOREIGN KEY (badge_id)
        REFERENCES badge(badge_id),

    UNIQUE (member_id, badge_id)
);


-- ============================================================
-- 16. EVENT INTERACTION
-- AI 추천용 사용자 행동 데이터
--
-- 관심 가수 / 관심 장르 / 좋아요 / 조회 / 검색 / 관심공연
-- ============================================================

CREATE TABLE event_interaction (
    interaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    member_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,

    interaction_type VARCHAR(20) NOT NULL
        COMMENT 'VIEW, SEARCH, LIKE, INTEREST',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (member_id)
        REFERENCES member(member_id),

    FOREIGN KEY (event_id)
        REFERENCES event(event_id)
);


-- ============================================================
-- 17. RECOMMENDATION
-- AI 공연 추천 결과
-- ============================================================

CREATE TABLE recommendation (
    recommendation_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    member_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,

    score DECIMAL(5,2),

    reason VARCHAR(500),

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (member_id)
        REFERENCES member(member_id),

    FOREIGN KEY (event_id)
        REFERENCES event(event_id)
);


-- ============================================================
-- 18. NOTIFICATION
-- 알림
--
-- member_id NULL = 전체 공지
-- ============================================================

CREATE TABLE notification (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    member_id BIGINT NULL,
    event_id BIGINT NULL,

    type VARCHAR(30) NOT NULL
        COMMENT 'TICKET_OPEN, ARTIST_EVENT, EVENT_UPCOMING, WEATHER, RECOMMENDATION, COMMUNITY, ORDER, NOTICE, FESTIVAL_RECORD, RECORD_REMINDER',

    title VARCHAR(200) NOT NULL,

    content VARCHAR(1000),

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (member_id)
        REFERENCES member(member_id),

    FOREIGN KEY (event_id)
        REFERENCES event(event_id)
);


-- ============================================================
-- 19. EVENT NEWS
-- 공연 소식 / 라인업 변경 / 공연 공지 / 새로운 소식
-- ============================================================

CREATE TABLE event_news (
    news_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    event_id BIGINT NULL,
    artist_id BIGINT NULL,

    title VARCHAR(200) NOT NULL,

    content TEXT,

    news_type VARCHAR(30) NOT NULL
        COMMENT 'LINEUP, SCHEDULE, NOTICE, PERFORMANCE, MD, ARTIST',

    image_url VARCHAR(500),
    source_url VARCHAR(500)
        COMMENT '실제 기사 원문 링크',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id)
        REFERENCES event(event_id),

    FOREIGN KEY (artist_id)
        REFERENCES artist(artist_id)
);


-- ============================================================
-- 20. CHAT SESSION
-- AI 챗봇 대화방
-- ============================================================

CREATE TABLE chat_session (
    session_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    member_id BIGINT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (member_id)
        REFERENCES member(member_id)
);


-- ============================================================
-- 21. CHAT MESSAGE
-- AI 챗봇 메시지
-- ============================================================

CREATE TABLE chat_message (
    message_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    session_id BIGINT NOT NULL,

    sender VARCHAR(10) NOT NULL
        COMMENT 'USER, AI',

    message TEXT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (session_id)
        REFERENCES chat_session(session_id)
);


-- ============================================================
-- 22. FESTIVAL RECORD
-- 나의 페스티벌 기록
-- ============================================================

CREATE TABLE festival_record (
    record_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    member_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,

    title VARCHAR(200),
    content TEXT,

    ai_diary TEXT,
    ai_summary VARCHAR(1000),

    mood VARCHAR(100),

    poster_image_url VARCHAR(500),

    rating TINYINT
        COMMENT '1 ~ 5',

    one_line_review VARCHAR(200),

    memo VARCHAR(500),

    hashtag VARCHAR(300),

    is_shared BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (member_id)
        REFERENCES member(member_id),

    FOREIGN KEY (event_id)
        REFERENCES event(event_id)
);


-- ============================================================
-- 22-1. FESTIVAL RECORD AI QUOTA
-- AI 포스터 무료 생성 횟수를 (회원, 공연) 단위로 관리 - 기록을 지우고
-- 같은 공연으로 새 기록을 만들어도 무료 횟수가 초기화되지 않게 하기 위함
-- ============================================================

CREATE TABLE festival_record_ai_quota (
    quota_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    member_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,

    used_count INT NOT NULL DEFAULT 0,
    diary_used_count INT NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE (member_id, event_id),

    FOREIGN KEY (member_id)
        REFERENCES member(member_id),

    FOREIGN KEY (event_id)
        REFERENCES event(event_id)
);


-- ============================================================
-- 22-2. RECORD POSTER VERSION
-- 생성할 때마다 덮어쓰지 않고 버전을 남겨서, 나중에 갤러리에서 골라 쓸 수 있게 한다.
-- festival_record.poster_image_url은 이 중 현재 선택된 버전을 가리킨다.
-- ============================================================

CREATE TABLE record_poster_version (
    version_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    record_id BIGINT NOT NULL,

    image_url VARCHAR(500) NOT NULL,
    style_request VARCHAR(200),

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (record_id)
        REFERENCES festival_record(record_id)
);


-- ============================================================
-- 22-3. RECORD DIARY VERSION
-- AI 일기도 포스터와 동일하게 생성할 때마다 버전을 남긴다.
-- festival_record.ai_diary/ai_summary는 이 중 현재 선택된 버전을 가리킨다.
-- ============================================================

CREATE TABLE record_diary_version (
    version_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    record_id BIGINT NOT NULL,

    content TEXT NOT NULL,
    summary VARCHAR(1000),

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (record_id)
        REFERENCES festival_record(record_id)
);


-- ============================================================
-- 23. RECORD IMAGE
-- ============================================================

CREATE TABLE record_image (
    image_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    record_id BIGINT NOT NULL,

    image_url VARCHAR(500) NOT NULL,
    display_order INT NOT NULL DEFAULT 0
        COMMENT '사용자가 조정하는 사진 순서. 0번(가장 작은 값)이 대표 사진.',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (record_id)
        REFERENCES festival_record(record_id)
);


-- ============================================================
-- 24. RECORD SONG
-- 들은 노래
-- ============================================================

CREATE TABLE record_song (
    song_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    record_id BIGINT NOT NULL,

    song_title VARCHAR(200) NOT NULL,
    artist_name VARCHAR(100),
    album_cover_url VARCHAR(500)
        COMMENT '곡 검색 자동완성(iTunes Search API 등)으로 가져온 앨범 커버 이미지 URL',

    FOREIGN KEY (record_id)
        REFERENCES festival_record(record_id)
);


-- ============================================================
-- 25. RECORD FOOD
-- 먹은 음식
-- ============================================================

CREATE TABLE record_food (
    food_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    record_id BIGINT NOT NULL,

    food_name VARCHAR(200) NOT NULL,

    FOREIGN KEY (record_id)
        REFERENCES festival_record(record_id)
);


-- ============================================================
-- 26. RECORD SHARE
-- SNS 공유
-- ============================================================

CREATE TABLE record_share (
    share_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    record_id BIGINT NOT NULL,

    platform VARCHAR(30) NOT NULL
        COMMENT 'INSTAGRAM, X, FACEBOOK, ETC',

    share_url VARCHAR(500),

    shared_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (record_id)
        REFERENCES festival_record(record_id)
);


-- ============================================================
-- 27. POST
-- 커뮤니티
-- ============================================================

CREATE TABLE post (
    post_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    member_id BIGINT NOT NULL,

    category VARCHAR(30) NOT NULL
        COMMENT 'REVIEW, COMPANION, QUESTION, INFORMATION, EVENT, TRANSFER, FREE',

    title VARCHAR(200) NOT NULL,

    content TEXT,

    image_url VARCHAR(500),

    view_count INT NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (member_id)
        REFERENCES member(member_id)
);


-- ============================================================
-- 28. COMMENT
-- 댓글 + 대댓글
-- ============================================================

CREATE TABLE post_comment (
    comment_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    post_id BIGINT NOT NULL,

    member_id BIGINT NOT NULL,

    parent_id BIGINT NULL,

    content VARCHAR(1000) NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (post_id)
        REFERENCES post(post_id),

    FOREIGN KEY (member_id)
        REFERENCES member(member_id),

    FOREIGN KEY (parent_id)
        REFERENCES post_comment(comment_id)
);


-- ============================================================
-- 29. POST LIKE
-- ============================================================

CREATE TABLE post_like (
    post_like_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    post_id BIGINT NOT NULL,

    member_id BIGINT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (post_id)
        REFERENCES post(post_id),

    FOREIGN KEY (member_id)
        REFERENCES member(member_id),

    UNIQUE (post_id, member_id)
);


-- ============================================================
-- 30. REPORT
-- 게시글 / 댓글 / 사용자 / 거래 / 채팅 신고
-- ============================================================

CREATE TABLE report (
    report_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    target_type VARCHAR(20) NOT NULL
        COMMENT 'POST, COMMENT, USER, LISTING, MESSAGE',

    target_id BIGINT NOT NULL,

    reporter_id BIGINT NOT NULL,

    reason VARCHAR(500),

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        COMMENT 'PENDING, REVIEWED, REJECTED',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (reporter_id)
        REFERENCES member(member_id)
);


-- ============================================================
-- 31. MD PRODUCT
-- MD 상품
-- ============================================================

CREATE TABLE md_product (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    event_id BIGINT NOT NULL,

    name VARCHAR(200) NOT NULL,

    category VARCHAR(50),

    description TEXT,

    price DECIMAL(10,0) NOT NULL,

    stock INT NOT NULL DEFAULT 0,

    image_url VARCHAR(500),

    status VARCHAR(20) NOT NULL
        COMMENT 'PREORDER, ON_SALE, SOLD_OUT',

    preorder_deadline DATETIME,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id)
        REFERENCES event(event_id)
);


-- ============================================================
-- 32. MD ORDER
-- 사전예약 + 주문 통합
-- ============================================================

CREATE TABLE md_order (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    product_id BIGINT NOT NULL,

    member_id BIGINT NOT NULL,

    order_number VARCHAR(50) NOT NULL UNIQUE,

    quantity INT NOT NULL DEFAULT 1,

    total_price DECIMAL(10,0) NOT NULL,

    shipping_name VARCHAR(50) NOT NULL,
    shipping_address VARCHAR(300) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,

    status VARCHAR(20) NOT NULL
        COMMENT 'PAYMENT_WAIT, PAID, SHIPPED, COMPLETED, CANCELED',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)
        REFERENCES md_product(product_id),

    FOREIGN KEY (member_id)
        REFERENCES member(member_id)
);


-- ============================================================
-- 33. PAYMENT
-- MD 결제
-- ============================================================

CREATE TABLE payment (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    order_id BIGINT NOT NULL,

    toss_order_id VARCHAR(64) NOT NULL UNIQUE
        COMMENT 'Toss Payments에 넘긴 문자열 주문번호 (order_id와 별개)',

    payment_key VARCHAR(100) NOT NULL UNIQUE,

    payment_method VARCHAR(30) NOT NULL,

    amount DECIMAL(10,0) NOT NULL,

    status VARCHAR(20) NOT NULL
        COMMENT 'SUCCESS, FAIL, CANCELED',

    paid_at DATETIME,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id)
        REFERENCES md_order(order_id)
);


-- ============================================================
-- 34. USED LISTING
-- MD 중고거래
-- ============================================================

CREATE TABLE used_listing (
    listing_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    seller_id BIGINT NOT NULL,

    category VARCHAR(20) NOT NULL
        COMMENT 'CLOTHING, ALBUM, FASHION_GOODS, POSTER_PRINT, CHARACTER_GOODS, LIVING_GOODS, ACCESSORY, SLOGAN_TOWEL',

    tags VARCHAR(300)
        COMMENT '해시태그 검색용 (예: #넬 #페스티벌후드티), 아티스트/공연 테이블과 정식 연결은 하지 않는다',

    title VARCHAR(200) NOT NULL,

    description TEXT,

    price DECIMAL(10,0) NOT NULL,

    `condition` VARCHAR(20),

    trade_method VARCHAR(20),

    region VARCHAR(100),

    image_url VARCHAR(2000)
        COMMENT '업로드된 이미지 URL을 ","로 이어붙여 저장 (최소 2장)',

    status VARCHAR(20) NOT NULL DEFAULT 'ON_SALE'
        COMMENT 'ON_SALE, RESERVED, SOLD, CANCELED',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (seller_id)
        REFERENCES member(member_id)
);


-- ============================================================
-- 35. USED LIKE
-- ============================================================

CREATE TABLE used_like (
    used_like_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    listing_id BIGINT NOT NULL,

    member_id BIGINT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (listing_id)
        REFERENCES used_listing(listing_id),

    FOREIGN KEY (member_id)
        REFERENCES member(member_id),

    UNIQUE (listing_id, member_id)
);


-- ============================================================
-- 36. USED TRANSACTION
-- ============================================================

CREATE TABLE used_transaction (
    transaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    listing_id BIGINT NOT NULL,

    buyer_id BIGINT NOT NULL,

    price DECIMAL(10,0) NOT NULL,

    status VARCHAR(20) NOT NULL
        COMMENT 'REQUEST, APPROVED, PAID, COMPLETED, CANCELED',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    completed_at DATETIME,

    FOREIGN KEY (listing_id)
        REFERENCES used_listing(listing_id),

    FOREIGN KEY (buyer_id)
        REFERENCES member(member_id)
);


-- ============================================================
-- 36-1. USED TRANSACTION PAYMENT
-- 중고거래 결제 (Toss Payments)
-- ============================================================

CREATE TABLE used_transaction_payment (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    transaction_id BIGINT NOT NULL,

    toss_order_id VARCHAR(64) NOT NULL UNIQUE
        COMMENT 'Toss Payments에 넘긴 문자열 주문번호',

    payment_key VARCHAR(100) NOT NULL UNIQUE,

    payment_method VARCHAR(30) NOT NULL,

    amount DECIMAL(10,0) NOT NULL,

    status VARCHAR(20) NOT NULL
        COMMENT 'SUCCESS, FAIL, CANCELED',

    paid_at DATETIME,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (transaction_id)
        REFERENCES used_transaction(transaction_id)
);


-- ============================================================
-- 37. TRADE CHAT ROOM
-- 중고거래 실시간 채팅
-- ============================================================

CREATE TABLE trade_chat_room (
    room_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    transaction_id BIGINT NOT NULL UNIQUE,

    blocked BOOLEAN NOT NULL DEFAULT FALSE
        COMMENT '둘 중 한쪽이 차단하면 true, 양방향 송수신 금지',

    blocked_by BIGINT
        COMMENT '차단을 건 회원',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (transaction_id)
        REFERENCES used_transaction(transaction_id),

    FOREIGN KEY (blocked_by)
        REFERENCES member(member_id)
);


-- ============================================================
-- 38. TRADE CHAT MESSAGE
-- ============================================================

CREATE TABLE trade_chat_message (
    message_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    room_id BIGINT NOT NULL,

    sender_id BIGINT NOT NULL,

    message_type VARCHAR(20) NOT NULL DEFAULT 'TEXT'
        COMMENT 'TEXT, IMAGE',

    message VARCHAR(1000) NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (room_id)
        REFERENCES trade_chat_room(room_id),

    FOREIGN KEY (sender_id)
        REFERENCES member(member_id)
);


-- ============================================================
-- 39. OPEN CHAT ROOM
-- 페스티벌별 실시간 오픈채팅방
-- ============================================================

CREATE TABLE open_chat_room (
    room_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    event_id BIGINT NOT NULL,

    name VARCHAR(100) NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id)
        REFERENCES event(event_id)
);


-- ============================================================
-- 40. OPEN CHAT MEMBER
-- 오픈채팅방 참여자
-- ============================================================

CREATE TABLE open_chat_member (
    room_id BIGINT NOT NULL,

    member_id BIGINT NOT NULL,

    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    left_at DATETIME,

    is_mute BOOLEAN NOT NULL DEFAULT FALSE,

    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (room_id, member_id),

    FOREIGN KEY (room_id)
        REFERENCES open_chat_room(room_id),

    FOREIGN KEY (member_id)
        REFERENCES member(member_id)
);


-- ============================================================
-- 41. OPEN CHAT MESSAGE
-- ============================================================

CREATE TABLE open_chat_message (
    message_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    room_id BIGINT NOT NULL,

    member_id BIGINT NOT NULL,

    message VARCHAR(1000) NOT NULL,

    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (room_id)
        REFERENCES open_chat_room(room_id),

    FOREIGN KEY (member_id)
        REFERENCES member(member_id)
);


-- ============================================================
-- 42. LIVE STREAM
-- 라이브 방송
-- ============================================================

CREATE TABLE live_stream (
    stream_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    event_id BIGINT NOT NULL,

    host_member_id BIGINT NOT NULL,

    title VARCHAR(200) NOT NULL,

    description VARCHAR(1000),

    thumbnail_url VARCHAR(500),

    source_type VARCHAR(20) NOT NULL DEFAULT 'BROWSER'
        COMMENT 'BROWSER',

    stream_url VARCHAR(500),

    start_at DATETIME,

    end_at DATETIME,

    entrance_fee DECIMAL(10,0) NOT NULL DEFAULT 0,

    ad_enabled BOOLEAN NOT NULL DEFAULT FALSE,

    chat_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
        COMMENT 'SCHEDULED, LIVE, ENDED',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id)
        REFERENCES event(event_id),

    FOREIGN KEY (host_member_id)
        REFERENCES member(member_id)
);


-- ============================================================
-- 43. LIVE CHAT MESSAGE
-- ============================================================

CREATE TABLE live_chat_message (
    chat_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    stream_id BIGINT NOT NULL,

    member_id BIGINT NOT NULL,

    message VARCHAR(1000) NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (stream_id)
        REFERENCES live_stream(stream_id),

    FOREIGN KEY (member_id)
        REFERENCES member(member_id)
);


-- ============================================================
-- 44. LIVE PAYMENT
-- 라이브 입장료 결제
-- ============================================================

CREATE TABLE live_payment (
    payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    stream_id BIGINT NOT NULL,

    member_id BIGINT NOT NULL,

    toss_order_id VARCHAR(64) NOT NULL UNIQUE,

    payment_key VARCHAR(100) NOT NULL UNIQUE,

    payment_method VARCHAR(30) NOT NULL,

    amount DECIMAL(10,0) NOT NULL,

    status VARCHAR(20) NOT NULL
        COMMENT 'SUCCESS, FAIL, CANCELED',

    paid_at DATETIME,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (stream_id)
        REFERENCES live_stream(stream_id),

    FOREIGN KEY (member_id)
        REFERENCES member(member_id),

    CONSTRAINT uk_live_payment_stream_member
        UNIQUE (stream_id, member_id)
);


-- ============================================================
-- 45. DONATION
-- 라이브 방송 후원
-- ============================================================

CREATE TABLE donation (
    donation_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    stream_id BIGINT NOT NULL,

    donor_id BIGINT NOT NULL,

    amount DECIMAL(10,0) NOT NULL,

    message VARCHAR(200),

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        COMMENT 'PENDING, SUCCESS, FAIL',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (stream_id)
        REFERENCES live_stream(stream_id),

    FOREIGN KEY (donor_id)
        REFERENCES member(member_id)
);


-- ============================================================
-- 46. DONATION PAYMENT
-- 후원 결제
-- ============================================================

CREATE TABLE donation_payment (
    donation_payment_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    donation_id BIGINT NOT NULL UNIQUE,

    toss_order_id VARCHAR(64) NOT NULL UNIQUE,

    payment_key VARCHAR(100) NOT NULL UNIQUE,

    payment_method VARCHAR(30) NOT NULL,

    amount DECIMAL(10,0) NOT NULL,

    status VARCHAR(20) NOT NULL
        COMMENT 'SUCCESS, FAIL, CANCELED',

    paid_at DATETIME,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (donation_id)
        REFERENCES donation(donation_id)
);
