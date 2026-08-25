package com.example.festival.report.service;

import com.example.festival.member.entity.Member;
import com.example.festival.member.repository.MemberRepository;
import com.example.festival.report.dto.ReportRequest;
import com.example.festival.report.dto.ReportResponse;
import com.example.festival.report.entity.Report;
import com.example.festival.report.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private static final Set<String> VALID_TARGET_TYPES = Set.of("POST", "COMMENT", "USER", "LISTING", "MESSAGE");

    private final ReportRepository reportRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public ReportResponse createReport(Long reporterId, ReportRequest request) {
        if (!VALID_TARGET_TYPES.contains(request.targetType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "신고 대상 종류가 올바르지 않습니다.");
        }
        if (reportRepository.existsByTargetTypeAndTargetIdAndReporter_Id(
                request.targetType(), request.targetId(), reporterId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 신고한 게시글/댓글이에요.");
        }

        Member reporter = memberRepository.findById(reporterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."));

        Report report = new Report(request.targetType(), request.targetId(), reporter, request.reason());
        reportRepository.save(report);

        return new ReportResponse(report.getReportId(), report.getTargetType(), report.getTargetId(),
                report.getStatus(), report.getCreatedAt());
    }
}
