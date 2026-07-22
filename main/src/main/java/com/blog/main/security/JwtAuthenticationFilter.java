package com.blog.main.security;

import com.blog.main.entity.User;
import com.blog.main.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri.startsWith("/api/auth")
                || uri.startsWith("/media/")
                || uri.startsWith("/swagger")
                || uri.startsWith("/v3/api-docs");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String token = extractToken(request);

        if (StringUtils.hasText(token) && jwtUtils.validateToken(token)) {
            Claims claims = jwtUtils.extractAllClaims(token);
            Long userId = claims.get("userId", Long.class);

            if (userId == null) {
                SecurityContextHolder.clearContext();
                rejectUnauthorized(response, "Invalid token payload");
                return;
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null || !user.isActive()) {
                SecurityContextHolder.clearContext();
                rejectUnauthorized(response, "Account disabled or deleted");
                return;
            }

            UserPrincipal principal = new UserPrincipal(
                    user.getId(),
                    user.getUsername(),
                    "",
                    List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
            );

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            principal.getAuthorities()
                    );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authorizationHeader) && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);
        }

        String tokenParam = request.getParameter("token");
        return StringUtils.hasText(tokenParam) ? tokenParam : null;
    }

    private void rejectUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.resetBuffer();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding("UTF-8");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        try (PrintWriter writer = response.getWriter()) {
            writer.write("{\"error\":\"" + message.replace("\"", "\\\"") + "\"}");
            writer.flush();
        }
    }
}
