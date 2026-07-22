package com.blog.main.controller;

import com.blog.main.dto.UserDtos.UpdateProfileRequest;
import com.blog.main.dto.UserDtos.UserResponse;
import com.blog.main.security.UserPrincipal;
import com.blog.main.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(userService.getMe(principal.getUserId()));
    }

    @PutMapping(value = "/me", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserResponse> updateMeJson(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(userService.updateMe(principal.getUserId(), request, null));
    }

    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> updateMeMultipart(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestPart("data") UpdateProfileRequest request,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture
    ) {
        return ResponseEntity.ok(userService.updateMe(principal.getUserId(), request, profilePicture));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserResponse> getByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.getByUsername(username));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @GetMapping("/username/{username}/followers")
    public ResponseEntity<List<UserResponse>> getFollowers(@PathVariable String username) {
        return ResponseEntity.ok(userService.getFollowers(username));
    }

    @GetMapping("/username/{username}/following")
    public ResponseEntity<List<UserResponse>> getFollowing(@PathVariable String username) {
        return ResponseEntity.ok(userService.getFollowing(username));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> search(@RequestParam(value = "search", required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(userService.search(search));
        }
        return ResponseEntity.ok(userService.findAll());
    }
}
