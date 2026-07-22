package com.blog.main.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public final class UserDtos {

    private UserDtos() {
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String username;
        private String email;
        private String profilePicture;
        private String role;
        private boolean active;
        private String bio;
        private long postsCount;
        private long followersCount;
        private long followingCount;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProfileRequest {
        private String bio;
        private String profilePicture;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationResponse {
        private Long id;
        private String message;
        private boolean read;
        private LocalDateTime createdAt;
        private String targetUrl;
    }
}
