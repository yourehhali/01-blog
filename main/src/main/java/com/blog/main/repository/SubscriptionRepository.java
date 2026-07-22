package com.blog.main.repository;

import com.blog.main.entity.Subscription;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    List<Subscription> findByTargetId(Long targetId);

    List<Subscription> findBySubscriberId(Long subscriberId);

    Optional<Subscription> findBySubscriberIdAndTargetId(Long subscriberId, Long targetId);

    boolean existsBySubscriberIdAndTargetId(Long subscriberId, Long targetId);

    long countByTargetId(Long targetId);

    long countBySubscriberId(Long subscriberId);

    @Query("select s.target.id from Subscription s where s.subscriber.id = :subscriberId")
    List<Long> findTargetIdsBySubscriberId(@Param("subscriberId") Long subscriberId);

    @Query("select s.subscriber.id, count(s.id) from Subscription s where s.subscriber.id in :subscriberIds group by s.subscriber.id")
    List<Object[]> countBySubscriberIds(@Param("subscriberIds") List<Long> subscriberIds);

    @Query("select s.target.id, count(s.id) from Subscription s where s.target.id in :targetIds group by s.target.id")
    List<Object[]> countByTargetIds(@Param("targetIds") List<Long> targetIds);
}
