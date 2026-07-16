package com.blog.main.controller;

import com.blog.main.entity.Post;
import com.blog.main.service.PostService;
import org.springframework.web.bind.annotation.*;
import com.blog.main.dto.CreatePostRequest;
import com.blog.main.dto.PostResponse;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public List<Post> getPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/{id}")
    public PostResponse getPost(@PathVariable Long id) {
        return postService.getPostById(id);
    }

    @PostMapping
    public PostResponse createPost(@RequestBody CreatePostRequest request) {
        return postService.createPost(request);
    }

    @PutMapping("/{id}")
    public PostResponse updatePost(
            @PathVariable Long id,
            @RequestBody Post post
    ) {
        return postService.updatePost(id, post);
    }

    @DeleteMapping("/{id}")
    public void deletePost(@PathVariable Long id) {
        postService.deletePost(id);
    }
}