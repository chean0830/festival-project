package com.example.festival.report.repository;

import com.example.festival.report.entity.Report;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {

    // 같은 대상을 같은 사람이 중복 신고하지 못하게 체크
    boolean existsByTargetTypeAndTargetIdAndReporter_Id(String targetType, Long targetId, Long reporterId);
}
