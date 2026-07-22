package com.blog.main.controller;

import com.blog.main.dto.SubscriptionStatus;
import com.blog.main.security.UserPrincipal;
import com.blog.main.service.SubscriptionService;
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
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping("/{id}/subscribe")
    public ResponseEntity<Void> subscribe(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        subscriptionService.subscribe(principal.getUserId(), id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/subscribe")
    public ResponseEntity<Void> unsubscribe(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        subscriptionService.unsubscribe(principal.getUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/subscription-status")
    public ResponseEntity<SubscriptionStatus> getStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(subscriptionService.getStatus(id, principal.getUserId()));
    }
}
