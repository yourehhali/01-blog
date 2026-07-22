package com.blog.main.controller;

import com.blog.main.dto.LikeDtos.LikeResponse;
import com.blog.main.security.UserPrincipal;
import com.blog.main.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts/{postId}/like")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    @PostMapping
    public ResponseEntity<LikeResponse> like(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long postId
    ) {
        return ResponseEntity.ok(likeService.like(principal.getUsername(), postId));
    }

    @DeleteMapping
    public ResponseEntity<LikeResponse> unlike(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long postId
    ) {
        return ResponseEntity.ok(likeService.unlike(principal.getUsername(), postId));
    }

    @GetMapping
    public ResponseEntity<LikeResponse> status(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long postId
    ) {
        String username = principal != null ? principal.getUsername() : null;
        return ResponseEntity.ok(likeService.status(username, postId));
    }
}
