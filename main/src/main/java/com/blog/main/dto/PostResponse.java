package com.blog.main.dto;

import java.util.ArrayList;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {

    private Long id;

    private String authorUsername;

    private String title;

    private String content;

    private boolean published;

    private boolean hiddenByAdmin;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Long likes;

    private int commentsCount;

    private boolean likedByRequester;

    private List<String> mediaUrls = new ArrayList<>();
}
