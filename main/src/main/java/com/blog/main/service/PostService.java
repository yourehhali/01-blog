package com.blog.main.service;

import com.blog.main.dto.CreatePostRequest;
import com.blog.main.dto.PostResponse;
import com.blog.main.entity.Post;
import com.blog.main.entity.User;
import com.blog.main.mapper.PostMapper;
import com.blog.main.repository.CommentRepository;
import com.blog.main.repository.LikeRepository;
import com.blog.main.repository.PostRepository;
import com.blog.main.repository.SubscriptionRepository;
import com.blog.main.repository.UserRepository;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PostMapper postMapper;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final MediaStorageService mediaStorageService;

    @Transactional(readOnly = true)
    public List<PostResponse> listPublished(Long viewerId) {
        return postRepository.findPublishedVisible().stream()
                .map(post -> toResponse(post, viewerId))
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> listPublishedPaged(int page, int size, Long viewerId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findPublishedVisible(pageable);
        return posts.map(post -> toResponse(post, viewerId));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getFollowingFeed(Long userId, int page, int size) {
        List<Long> followedIds = subscriptionRepository.findTargetIdsBySubscriberId(userId);
        if (followedIds.isEmpty()) {
            Pageable pageable = PageRequest.of(page, size);
            return Page.empty(pageable);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findVisibleByAuthorIdsOrderByCreatedAtDesc(followedIds, pageable);
        return posts.map(post -> toResponse(post, userId));
    }

    @Transactional(readOnly = true)
    public Optional<PostResponse> getPublishedById(Long id, Long viewerId) {
        return postRepository.findVisibleById(id).map(post -> toResponse(post, viewerId));
    }

    @Transactional(readOnly = true)
    public Optional<PostResponse> getByIdForOwner(Long id, String username) {
        return postRepository.findWithAuthorById(id)
                .filter(post -> post.getAuthor().getUsername().equals(username))
                .map(post -> toResponse(post, post.getAuthor().getId()));
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getProfilePosts(Long profileUserId, Long viewerId) {
        boolean isOwner = viewerId != null && profileUserId.equals(viewerId);
        List<Post> posts = isOwner
                ? postRepository.findByAuthorIdOrderByCreatedAtDesc(profileUserId)
                : postRepository.findVisibleByAuthorIdOrderByCreatedAtDesc(profileUserId);
        return posts.stream().map(post -> toResponse(post, viewerId)).toList();
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getProfilePostsPaged(Long profileUserId, Long viewerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        boolean isOwner = viewerId != null && profileUserId.equals(viewerId);
        Page<Post> posts = isOwner
                ? postRepository.findByAuthorIdOrderByCreatedAtDesc(profileUserId, pageable)
                : postRepository.findVisibleByAuthorIdOrderByCreatedAtDesc(profileUserId, pageable);
        return posts.map(post -> toResponse(post, viewerId));
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getAdminPosts() {
        return enrichPosts(postRepository.findAllWithAuthorOrderByCreatedAtDesc(), null);
    }

    public PostResponse createPost(String username, CreatePostRequest request, List<MultipartFile> mediaFiles) {
        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Author not found"));

        Post post = postMapper.toEntity(request);
        mergeUploadedMedia(post, mediaFiles);
        post.setAuthor(author);
        Post savedPost = postRepository.save(post);
        return toResponse(savedPost, author.getId());
    }

    public PostResponse updatePost(String username, Long id, CreatePostRequest request, List<MultipartFile> mediaFiles) {
        Post post = getOwnedPost(id, username);
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setPublished(Boolean.TRUE.equals(request.getPublished()));
        post.setMediaUrls(new ArrayList<>(request.getMediaUrls()));
        mergeUploadedMedia(post, mediaFiles);
        Post savedPost = postRepository.save(post);
        return toResponse(savedPost, post.getAuthor().getId());
    }

    public void deletePost(String username, Long id) {
        Post post = getOwnedPost(id, username);
        postRepository.delete(post);
    }

    public void adminDeletePost(Long id) {
        postRepository.deleteById(id);
    }

    public void setHiddenByAdmin(Long id, boolean hidden) {
        Post post = postRepository.findWithAuthorById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        post.setHiddenByAdmin(hidden);
        postRepository.save(post);
    }

    private Post getOwnedPost(Long id, String username) {
        Post post = postRepository.findWithAuthorById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!post.getAuthor().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not owner");
        }
        return post;
    }

    private void mergeUploadedMedia(Post post, List<MultipartFile> mediaFiles) {
        if (mediaFiles == null || mediaFiles.isEmpty()) {
            return;
        }
        try {
            List<String> mergedMedia = new ArrayList<>(post.getMediaUrls());
            mergedMedia.addAll(mediaStorageService.storeMany(mediaFiles));
            if (mergedMedia.size() > 3) {
                throw new IllegalArgumentException("A post can have at most 3 media files");
            }
            post.setMediaUrls(mergedMedia);
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to store post media", exception);
        }
    }

    private PostResponse toResponse(Post post, Long viewerId) {
        return enrichPosts(List.of(post), viewerId).stream()
                .findFirst()
                .orElseGet(() -> postMapper.toResponse(post));
    }

    private List<PostResponse> enrichPosts(List<Post> posts, Long viewerId) {
        if (posts.isEmpty()) {
            return List.of();
        }

        List<Long> postIds = posts.stream().map(Post::getId).toList();
        Map<Long, Long> commentCounts = toLongMap(commentRepository.countByPostIds(postIds));
        Map<Long, Long> likeCounts = toLongMap(likeRepository.countByPostIds(postIds));
        Set<Long> likedPostIds = viewerId == null
                ? Collections.emptySet()
                : new HashSet<>(likeRepository.findLikedPostIdsByUserAndPostIds(viewerId, postIds));

        return posts.stream().map(post -> {
            PostResponse response = postMapper.toResponse(post);
            response.setCommentsCount(commentCounts.getOrDefault(post.getId(), 0L).intValue());
            response.setLikes(likeCounts.getOrDefault(post.getId(), 0L));
            response.setLikedByRequester(likedPostIds.contains(post.getId()));
            return response;
        }).toList();
    }

    private Map<Long, Long> toLongMap(List<Object[]> rows) {
        Map<Long, Long> result = new HashMap<>();
        for (Object[] row : rows) {
            Number key = (Number) row[0];
            Number value = (Number) row[1];
            result.put(key.longValue(), value.longValue());
        }
        return result;
    }
}
