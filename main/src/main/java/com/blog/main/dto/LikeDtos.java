package com.blog.main.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public final class LikeDtos {

    private LikeDtos() {
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LikeResponse {
        private long likes;
        private boolean likedByRequester;
    }
}
