package com.blog.main.mapper;

import com.blog.main.dto.UserDtos.NotificationResponse;
import com.blog.main.dto.UserDtos.UserResponse;
import com.blog.main.entity.Notification;
import com.blog.main.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setProfilePicture(user.getProfilePicture());
        response.setRole(user.getRole().name());
        response.setActive(user.isActive());
        response.setBio(user.getBio());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }

    public NotificationResponse toNotificationResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setMessage(notification.getMessage());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        response.setTargetUrl(notification.getTargetUrl());
        return response;
    }
}
