package com.blog.main.controller;

import com.blog.main.dto.CreatePostRequest;
import com.blog.main.dto.PostResponse;
import jakarta.validation.Valid;
import com.blog.main.service.PostService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.blog.main.security.UserPrincipal;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @GetMapping
    public ResponseEntity<Page<PostResponse>> getPosts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long viewerId = principal != null ? principal.getUserId() : null;
        return ResponseEntity.ok(postService.listPublishedPaged(page, Math.min(size, 50), viewerId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<PostResponse>> getAllPublishedPosts(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long viewerId = principal != null ? principal.getUserId() : null;
        return ResponseEntity.ok(postService.listPublished(viewerId));
    }

    @GetMapping("/following")
    public ResponseEntity<Page<PostResponse>> getFollowingPosts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(postService.getFollowingFeed(principal.getUserId(), page, Math.min(size, 50)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPost(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long viewerId = principal != null ? principal.getUserId() : null;
        return postService.getPublishedById(id, viewerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/edit")
    public ResponseEntity<PostResponse> getPostForEdit(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return postService.getByIdForOwner(id, principal.getUsername())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<PostResponse>> getProfilePosts(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long viewerId = principal != null ? principal.getUserId() : null;
        return ResponseEntity.ok(postService.getProfilePosts(userId, viewerId));
    }

    @GetMapping("/users/{userId}/paged")
    public ResponseEntity<Page<PostResponse>> getProfilePostsPaged(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long viewerId = principal != null ? principal.getUserId() : null;
        return ResponseEntity.ok(postService.getProfilePostsPaged(userId, viewerId, page, Math.min(size, 50)));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PostResponse> createPostJson(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreatePostRequest request
    ) {
        return ResponseEntity.status(201)
                .body(postService.createPost(principal.getUsername(), request, null));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse> createPostMultipart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestPart("data") @Valid CreatePostRequest request,
            @RequestPart(value = "media", required = false) List<MultipartFile> mediaFiles
    ) {
        return ResponseEntity.status(201)
                .body(postService.createPost(principal.getUsername(), request, mediaFiles));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PostResponse> updatePostJson(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CreatePostRequest request
    ) {
        return ResponseEntity.ok(postService.updatePost(principal.getUsername(), id, request, null));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse> updatePostMultipart(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestPart("data") @Valid CreatePostRequest request,
            @RequestPart(value = "media", required = false) List<MultipartFile> mediaFiles
    ) {
        return ResponseEntity.ok(postService.updatePost(principal.getUsername(), id, request, mediaFiles));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        postService.deletePost(principal.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
