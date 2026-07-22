package com.blog.main.service;

import com.blog.main.dto.UserDtos.NotificationResponse;
import com.blog.main.entity.Notification;
import com.blog.main.entity.User;
import com.blog.main.mapper.UserMapper;
import com.blog.main.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserMapper userMapper;
    private final SseService sseService;

    public List<NotificationResponse> getForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId).stream()
                .map(userMapper::toNotificationResponse)
                .toList();
    }

    public Page<NotificationResponse> getForUser(Long userId, int page, int size) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(
                        userId,
                        PageRequest.of(page, size)
                )
                .map(userMapper::toNotificationResponse);
    }

    public int getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Transactional
    public void createNotification(User recipient, String message, String targetUrl) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setMessage(message);
        notification.setTargetUrl(targetUrl);
        notification = notificationRepository.save(notification);
        try {
            sseService.sendNotification(recipient.getId(), userMapper.toNotificationResponse(notification));
        } catch (Exception ignored) {
            // SSE delivery failure should not fail the request transaction.
        }
    }
}
