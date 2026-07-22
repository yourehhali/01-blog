package com.blog.main.dto;

import com.blog.main.entity.ReportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public final class ReportDtos {

    private ReportDtos() {
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportRequest {
        @NotNull
        private ReportType reportType;

        @NotNull
        private Long targetId;

        @NotBlank
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportAdminResponse {
        private Long id;
        private String reportType;
        private Long targetId;
        private String targetUsername;
        private String reason;
        private String reporterUsername;
        private LocalDateTime createdAt;
    }
}
