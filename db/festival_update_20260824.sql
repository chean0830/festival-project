USE festival;

-- 2026-08-24 팀 변경사항 반영
-- 댓글/대댓글에 하트(좋아요) 기능 추가를 위해 post_comment_like 테이블 신규 생성
CREATE TABLE post_comment_like (
    comment_like_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    comment_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id)
        REFERENCES post_comment(comment_id),
    FOREIGN KEY (member_id)
        REFERENCES member(member_id),
    UNIQUE (comment_id, member_id)
);
