package com.blog.main.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public final class CommentDtos {

    private CommentDtos() {
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentCreateRequest {
        @NotBlank
        @Size(max = 1000)
        private String content;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentResponse {
        private Long id;
        private Long postId;
        private String content;
        private String authorUsername;
        private LocalDateTime createdAt;
    }
}
