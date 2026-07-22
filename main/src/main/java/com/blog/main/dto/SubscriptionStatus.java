package com.blog.main.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionStatus {

    private boolean subscribed;
    private long followersCount;
    private long followingCount;
}
