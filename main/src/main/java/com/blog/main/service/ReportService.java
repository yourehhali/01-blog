package com.blog.main.service;

import com.blog.main.dto.ReportDtos.ReportAdminResponse;
import com.blog.main.dto.ReportDtos.ReportRequest;
import com.blog.main.entity.Report;
import com.blog.main.entity.ReportType;
import com.blog.main.mapper.ReportMapper;
import com.blog.main.repository.PostRepository;
import com.blog.main.repository.ReportRepository;
import com.blog.main.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ReportMapper reportMapper;

    public void report(Long reporterId, ReportRequest request) {
        boolean exists = request.getReportType() == ReportType.USER
                ? userRepository.existsById(request.getTargetId())
                : postRepository.existsById(request.getTargetId());

        if (!exists) {
            throw new EntityNotFoundException("Target not found");
        }

        Report report = new Report();
        report.setReporter(userRepository.getReferenceById(reporterId));
        report.setReportType(request.getReportType());
        report.setTargetId(request.getTargetId());
        report.setReason(request.getReason());
        reportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public List<ReportAdminResponse> findAllForAdmin() {
        return reportRepository.findAllWithReporter().stream()
                .map(this::toAdminResponse)
                .toList();
    }

    public void deleteReport(Long reportId) {
        reportRepository.deleteById(reportId);
    }

    private ReportAdminResponse toAdminResponse(Report report) {
        ReportAdminResponse response = reportMapper.toAdminResponse(report);

        if (report.getReportType() == ReportType.USER) {
            response.setTargetUsername(
                    userRepository.findById(report.getTargetId())
                            .map(user -> user.getUsername())
                            .orElse("unknown")
            );
        }

        return response;
    }
}
