package com.blog.main.mapper;

import com.blog.main.dto.CreatePostRequest;
import com.blog.main.dto.PostResponse;
import com.blog.main.entity.Post;
import java.util.ArrayList;
import org.springframework.stereotype.Component;

@Component
public class PostMapper {

    public Post toEntity(CreatePostRequest request) {
        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setPublished(Boolean.TRUE.equals(request.getPublished()));
        post.setMediaUrls(new ArrayList<>(request.getMediaUrls()));
        return post;
    }

    public PostResponse toResponse(Post post) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setAuthorUsername(post.getAuthor() != null ? post.getAuthor().getUsername() : null);
        response.setTitle(post.getTitle());
        response.setContent(post.getContent());
        response.setPublished(post.isPublished());
        response.setHiddenByAdmin(post.isHiddenByAdmin());
        response.setCreatedAt(post.getCreatedAt());
        response.setUpdatedAt(post.getUpdatedAt());
        response.setLikes(0L);
        response.setCommentsCount(0);
        response.setLikedByRequester(false);
        response.setMediaUrls(new ArrayList<>(post.getMediaUrls()));
        return response;
    }
}
