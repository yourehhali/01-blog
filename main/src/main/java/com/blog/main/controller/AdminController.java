package com.blog.main.controller;

import com.blog.main.dto.PostResponse;
import com.blog.main.dto.ReportDtos.ReportAdminResponse;
import com.blog.main.dto.UserDtos.UserResponse;
import com.blog.main.repository.PostRepository;
import com.blog.main.repository.ReportRepository;
import com.blog.main.repository.UserRepository;
import com.blog.main.service.PostService;
import com.blog.main.service.ReportService;
import com.blog.main.service.UserService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PostRepository postRepository;
    private final PostService postService;
    private final ReportRepository reportRepository;
    private final ReportService reportService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.countByActiveTrue());
        stats.put("totalPosts", postRepository.count());
        stats.put("totalReports", reportRepository.count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/posts")
    public ResponseEntity<List<PostResponse>> getPosts() {
        return ResponseEntity.ok(postService.getAdminPosts());
    }

    @PutMapping("/users/{id}/ban")
    @Transactional
    public ResponseEntity<Void> banUser(@PathVariable Long id) {
        userService.banUser(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}/unban")
    @Transactional
    public ResponseEntity<Void> unbanUser(@PathVariable Long id) {
        userService.unbanUser(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reports")
    public ResponseEntity<List<ReportAdminResponse>> getReports() {
        return ResponseEntity.ok(reportService.findAllForAdmin());
    }

    @DeleteMapping("/reports/{id}")
    @Transactional
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/posts/{id}")
    @Transactional
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.adminDeletePost(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/posts/{id}/hide")
    @Transactional
    public ResponseEntity<Void> hidePost(@PathVariable Long id) {
        postService.setHiddenByAdmin(id, true);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/posts/{id}/unhide")
    @Transactional
    public ResponseEntity<Void> unhidePost(@PathVariable Long id) {
        postService.setHiddenByAdmin(id, false);
        return ResponseEntity.ok().build();
    }
}
