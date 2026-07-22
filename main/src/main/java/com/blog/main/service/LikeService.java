package com.blog.main.service;

import com.blog.main.dto.LikeDtos.LikeResponse;
import com.blog.main.entity.Like;
import com.blog.main.entity.Post;
import com.blog.main.entity.User;
import com.blog.main.mapper.LikeMapper;
import com.blog.main.repository.LikeRepository;
import com.blog.main.repository.PostRepository;
import com.blog.main.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
@RequiredArgsConstructor
public class LikeService {

    private final PostRepository postRepository;
    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final LikeMapper likeMapper;

    public LikeResponse like(String username, Long postId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Post post = postRepository.findWithAuthorById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!likeRepository.existsByPostAndUser(post, user)) {
            Like like = new Like();
            like.setPost(post);
            like.setUser(user);
            try {
                likeRepository.saveAndFlush(like);
                if (!post.getAuthor().getId().equals(user.getId())) {
                    notificationService.createNotification(
                            post.getAuthor(),
                            user.getUsername() + " liked your post.",
                            "/post/" + post.getId()
                    );
                }
            } catch (DataIntegrityViolationException ignored) {
                // Duplicate like from a concurrent request.
            }
        }
        return buildResponse(post, user);
    }

    public LikeResponse unlike(String username, Long postId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Post post = postRepository.findWithAuthorById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        likeRepository.findByPostAndUser(post, user).ifPresent(likeRepository::delete);
        return buildResponse(post, user);
    }

    @Transactional(readOnly = true)
    public LikeResponse status(String username, Long postId) {
        Post post = postRepository.findWithAuthorById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (username == null) {
            return likeMapper.toResponse(likeRepository.countByPost(post), false);
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return buildResponse(post, user);
    }

    private LikeResponse buildResponse(Post post, User user) {
        return likeMapper.toResponse(
                likeRepository.countByPost(post),
                likeRepository.existsByPostAndUser(post, user)
        );
    }
}
