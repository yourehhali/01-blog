package com.blog.main.repository;

import com.blog.main.entity.Comment;
import com.blog.main.entity.Post;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("""
        select c from Comment c
        join fetch c.author
        join fetch c.post
        where c.post = :post
        order by c.createdAt asc
    """)
    List<Comment> findByPostOrderByCreatedAtAsc(@Param("post") Post post);

    long countByPost(Post post);

    @Query("""
        select c.post.id, count(c.id)
        from Comment c
        where c.post.id in :postIds
        group by c.post.id
    """)
    List<Object[]> countByPostIds(@Param("postIds") List<Long> postIds);
}
