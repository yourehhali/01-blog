package com.blog.main.mapper;

import com.blog.main.dto.CreatePostRequest;
import com.blog.main.dto.PostResponse;
import com.blog.main.entity.Post;
import org.springframework.stereotype.Component;


@Component
public class PostMapper {


    public Post toEntity(CreatePostRequest request) {

        Post post = new Post();

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());

        return post;
    }


    public PostResponse toResponse(Post post) {

        PostResponse response = new PostResponse();

        response.setId(post.getId());
        response.setTitle(post.getTitle());
        response.setContent(post.getContent());
        response.setCreatedAt(post.getCreatedAt());
        response.setUpdatedAt(post.getUpdatedAt());

        return response;
    }
}