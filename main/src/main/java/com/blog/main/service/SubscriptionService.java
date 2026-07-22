package com.blog.main.service;

import com.blog.main.dto.SubscriptionStatus;
import com.blog.main.entity.Subscription;
import com.blog.main.entity.User;
import com.blog.main.repository.SubscriptionRepository;
import com.blog.main.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public void subscribe(Long subscriberId, Long targetId) {
        if (subscriberId.equals(targetId)) {
            throw new IllegalArgumentException("Cannot subscribe to yourself");
        }
        if (subscriptionRepository.existsBySubscriberIdAndTargetId(subscriberId, targetId)) {
            return;
        }

        User subscriber = userRepository.findById(subscriberId)
                .orElseThrow(() -> new EntityNotFoundException("Subscriber not found"));
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new EntityNotFoundException("Target not found"));

        Subscription subscription = new Subscription();
        subscription.setSubscriber(subscriber);
        subscription.setTarget(target);

        try {
            subscriptionRepository.save(subscription);
            notificationService.createNotification(
                    target,
                    subscriber.getUsername() + " started following you.",
                    "/profile/" + subscriber.getUsername()
            );
        } catch (DataIntegrityViolationException ignored) {
            // Duplicate subscription caused by a concurrent request.
        }
    }

    public void unsubscribe(Long subscriberId, Long targetId) {
        subscriptionRepository.findBySubscriberIdAndTargetId(subscriberId, targetId)
                .ifPresent(subscriptionRepository::delete);
    }

    @Transactional(readOnly = true)
    public SubscriptionStatus getStatus(Long userId, Long viewerId) {
        long followersCount = subscriptionRepository.countByTargetId(userId);
        long followingCount = subscriptionRepository.countBySubscriberId(userId);
        boolean subscribed = viewerId != null
                && subscriptionRepository.existsBySubscriberIdAndTargetId(viewerId, userId);
        return new SubscriptionStatus(subscribed, followersCount, followingCount);
    }
}
