package com.blog.main.mapper;

import com.blog.main.dto.ReportDtos.ReportAdminResponse;
import com.blog.main.entity.Report;
import org.springframework.stereotype.Component;

@Component
public class ReportMapper {

    public ReportAdminResponse toAdminResponse(Report report) {
        ReportAdminResponse response = new ReportAdminResponse();
        response.setId(report.getId());
        response.setReportType(report.getReportType().name());
        response.setTargetId(report.getTargetId());
        response.setReason(report.getReason());
        response.setCreatedAt(report.getCreatedAt());
        response.setReporterUsername(
                report.getReporter() != null ? report.getReporter().getUsername() : "unknown"
        );
        return response;
    }
}
