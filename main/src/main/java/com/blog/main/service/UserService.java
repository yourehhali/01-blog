package com.blog.main.service;

import com.blog.main.dto.UserDtos.UpdateProfileRequest;
import com.blog.main.dto.UserDtos.UserResponse;
import com.blog.main.entity.User;
import com.blog.main.mapper.UserMapper;
import com.blog.main.repository.PostRepository;
import com.blog.main.repository.SubscriptionRepository;
import com.blog.main.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserMapper userMapper;
    private final MediaStorageService mediaStorageService;

    public UserResponse getMe(Long userId) {
        return getById(userId);
    }

    public UserResponse getById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return toResponse(user);
    }

    public UserResponse getByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return toResponse(user);
    }

    @Transactional
    public UserResponse updateMe(Long userId, UpdateProfileRequest request, MultipartFile profilePicture) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getProfilePicture() != null) {
            user.setProfilePicture(request.getProfilePicture());
        }
        if (profilePicture != null && !profilePicture.isEmpty()) {
            try {
                user.setProfilePicture(mediaStorageService.store(profilePicture));
            } catch (Exception exception) {
                throw new IllegalStateException("Failed to store profile picture", exception);
            }
        }
        return toResponse(userRepository.save(user));
    }

    public List<UserResponse> search(String query) {
        return toResponses(userRepository.searchByUsername(query));
    }

    public List<UserResponse> findAll() {
        return toResponses(userRepository.findAllByCreatedAtDesc());
    }

    public List<UserResponse> getFollowers(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        List<User> followers = subscriptionRepository.findByTargetId(user.getId()).stream()
                .map(subscription -> subscription.getSubscriber())
                .toList();
        return toResponses(followers);
    }

    public List<UserResponse> getFollowing(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        List<User> following = subscriptionRepository.findBySubscriberId(user.getId()).stream()
                .map(subscription -> subscription.getTarget())
                .toList();
        return toResponses(following);
    }

    @Transactional
    public void banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional
    public void unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setActive(true);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    private UserResponse toResponse(User user) {
        UserResponse response = userMapper.toUserResponse(user);
        response.setPostsCount(postRepository.countByAuthorId(user.getId()));
        response.setFollowersCount(subscriptionRepository.countByTargetId(user.getId()));
        response.setFollowingCount(subscriptionRepository.countBySubscriberId(user.getId()));
        return response;
    }

    private List<UserResponse> toResponses(List<User> users) {
        if (users.isEmpty()) {
            return List.of();
        }

        List<Long> userIds = users.stream().map(User::getId).toList();
        Map<Long, Long> postsByAuthor = toCountMap(postRepository.countByAuthorIds(userIds));
        Map<Long, Long> followersByUser = toCountMap(subscriptionRepository.countByTargetIds(userIds));
        Map<Long, Long> followingByUser = toCountMap(subscriptionRepository.countBySubscriberIds(userIds));

        return users.stream().map(user -> {
            UserResponse response = userMapper.toUserResponse(user);
            response.setPostsCount(postsByAuthor.getOrDefault(user.getId(), 0L));
            response.setFollowersCount(followersByUser.getOrDefault(user.getId(), 0L));
            response.setFollowingCount(followingByUser.getOrDefault(user.getId(), 0L));
            return response;
        }).toList();
    }

    private Map<Long, Long> toCountMap(List<Object[]> rows) {
        Map<Long, Long> counts = new HashMap<>();
        for (Object[] row : rows) {
            Number key = (Number) row[0];
            Number value = (Number) row[1];
            counts.put(key.longValue(), value.longValue());
        }
        return counts;
    }
}
