package com.example.festival.report.entity;

import com.example.festival.member.entity.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * report 테이블 매핑. 게시글/댓글/유저/중고거래/채팅 신고를 한 테이블에서 공용으로 다룬다.
 * targetType: POST, COMMENT, USER, LISTING, MESSAGE
 * status: PENDING, REVIEWED, REJECTED (기본값 PENDING, 운영자가 검토 후 상태 변경 — 그 화면은 아직 없음)
 */
@Entity
@Table(name = "report")
@Getter
@NoArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @Column(name = "target_type", nullable = false, length = 20)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private Member reporter;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Report(String targetType, Long targetId, Member reporter, String reason) {
        this.targetType = targetType;
        this.targetId = targetId;
        this.reporter = reporter;
        this.reason = reason;
        this.status = "PENDING";
    }
}
