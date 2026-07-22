package com.blog.main.service;

import com.blog.main.dto.AuthDtos.AuthResponse;
import com.blog.main.dto.AuthDtos.LoginRequest;
import com.blog.main.entity.RefreshToken;
import com.blog.main.entity.Role;
import com.blog.main.entity.User;
import com.blog.main.repository.UserRepository;
import com.blog.main.security.JwtUtils;
import com.blog.main.security.UserPrincipal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public User register(String username, String email, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already in use");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(userRepository.count() == 0 ? Role.ADMIN : Role.USER);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getIdentifier(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        String accessToken = jwtUtils.generateAccessToken(principal);
        String refreshToken = refreshTokenService.createRefreshToken(user);
        return new AuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken refreshToken = refreshTokenService.findByToken(rawRefreshToken)
                .filter(token -> !token.isRevoked())
                .filter(token -> token.getExpiry().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired refresh token"));

        User user = refreshToken.getUser();
        if (!user.isActive()) {
            refreshTokenService.revokeToken(rawRefreshToken);
            throw new IllegalArgumentException("User account is inactive");
        }

        UserPrincipal principal = new UserPrincipal(
                user.getId(),
                user.getUsername(),
                "",
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        return new AuthResponse(jwtUtils.generateAccessToken(principal), rawRefreshToken);
    }

    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }
        refreshTokenService.revokeToken(rawRefreshToken);
    }
}
