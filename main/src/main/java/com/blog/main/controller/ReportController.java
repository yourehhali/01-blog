package com.blog.main.controller;

import com.blog.main.dto.ReportDtos.ReportRequest;
import com.blog.main.security.UserPrincipal;
import com.blog.main.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<Void> submitReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ReportRequest request
    ) {
        reportService.report(principal.getUserId(), request);
        return ResponseEntity.ok().build();
    }
}
