package com.blog.main.service;

import com.blog.main.dto.CommentDtos.CommentCreateRequest;
import com.blog.main.dto.CommentDtos.CommentResponse;
import com.blog.main.entity.Comment;
import com.blog.main.entity.Post;
import com.blog.main.entity.User;
import com.blog.main.mapper.CommentMapper;
import com.blog.main.repository.CommentRepository;
import com.blog.main.repository.PostRepository;
import com.blog.main.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final CommentMapper commentMapper;

    @Transactional(readOnly = true)
    public List<CommentResponse> listForPost(Long postId) {
        Post post = postRepository.findWithAuthorById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        return commentRepository.findByPostOrderByCreatedAtAsc(post).stream()
                .map(commentMapper::toResponse)
                .toList();
    }

    public CommentResponse add(String username, Long postId, CommentCreateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Post post = postRepository.findWithAuthorById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        Comment comment = new Comment();
        comment.setAuthor(user);
        comment.setPost(post);
        comment.setContent(request.getContent());
        Comment savedComment = commentRepository.save(comment);

        if (!post.getAuthor().getId().equals(user.getId())) {
            notificationService.createNotification(
                    post.getAuthor(),
                    user.getUsername() + " commented on your post.",
                    "/post/" + post.getId()
            );
        }

        return commentMapper.toResponse(savedComment);
    }

    public void delete(String username, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        boolean isCommentAuthor = comment.getAuthor().getUsername().equals(username);
        boolean isPostOwner = comment.getPost().getAuthor().getUsername().equals(username);
        if (!isCommentAuthor && !isPostOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }

        commentRepository.delete(comment);
    }
}
