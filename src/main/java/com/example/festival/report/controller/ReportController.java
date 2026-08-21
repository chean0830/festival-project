package com.example.festival.report.controller;

import com.example.festival.report.dto.ReportRequest;
import com.example.festival.report.dto.ReportResponse;
import com.example.festival.report.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * 신고 API. 게시글/댓글/유저/중고거래/채팅 공용 (target_type으로 구분).
 * 로그인 필요 (다른 회원 전용 API와 동일하게 /api/members/{memberId} 하위).
 */
@RestController
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping("/api/members/{memberId}/reports")
    public ReportResponse createReport(@PathVariable Long memberId, @Valid @RequestBody ReportRequest request) {
        return reportService.createReport(memberId, request);
    }
}
