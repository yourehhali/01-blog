package com.blog.main.service;

import com.blog.main.entity.Post;
import com.blog.main.repository.PostRepository;
import com.blog.main.mapper.PostMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final PostMapper postMapper;

    public PostService(
        PostRepository postRepository,
        PostMapper postMapper
        ) {
        this.postRepository = postRepository;
        this.postMapper = postMapper;
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public PostResponse createPost(CreatePostRequest request) {
        Post post = postMapper.toEntity(request);
        Post savedPost = postRepository.save(post);
        return postMapper.toResponse(savedPost);
    }

    public Post updatePost(Long id, Post updatedPost) {
        Post post = getPostById(id);

        post.setTitle(updatedPost.getTitle());
        post.setContent(updatedPost.getContent());
        post.setUpdatedAt(LocalDateTime.now());

        return postRepository.save(post);
    }

    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }
}