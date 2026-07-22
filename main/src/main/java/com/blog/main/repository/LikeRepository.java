package com.blog.main.repository;

import com.blog.main.entity.Like;
import com.blog.main.entity.Post;
import com.blog.main.entity.User;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LikeRepository extends JpaRepository<Like, Long> {

    boolean existsByPostAndUser(Post post, User user);

    Optional<Like> findByPostAndUser(Post post, User user);

    long countByPost(Post post);

    @Query("""
        select l.post.id, count(l.id)
        from Like l
        where l.post.id in :postIds
        group by l.post.id
    """)
    List<Object[]> countByPostIds(@Param("postIds") Collection<Long> postIds);

    @Query("""
        select l.post.id
        from Like l
        where l.user.id = :userId and l.post.id in :postIds
    """)
    List<Long> findLikedPostIdsByUserAndPostIds(@Param("userId") Long userId, @Param("postIds") Collection<Long> postIds);
}
