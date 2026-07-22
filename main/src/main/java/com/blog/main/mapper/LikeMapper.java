package com.blog.main.mapper;

import com.blog.main.dto.LikeDtos.LikeResponse;
import org.springframework.stereotype.Component;

@Component
public class LikeMapper {

    public LikeResponse toResponse(long likes, boolean likedByRequester) {
        return new LikeResponse(likes, likedByRequester);
    }
}
