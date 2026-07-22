package com.blog.main.repository;

import com.blog.main.entity.Post;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("""
        select p from Post p
        join fetch p.author
        where p.published = true and p.hiddenByAdmin = false
        order by p.createdAt desc
    """)
    List<Post> findPublishedVisible();

    @Query("""
        select p from Post p
        join fetch p.author
        where p.published = true and p.hiddenByAdmin = false
        order by p.createdAt desc
    """)
    Page<Post> findPublishedVisible(Pageable pageable);

    @Query("""
        select p from Post p
        join fetch p.author
        where p.author.id = :userId
        order by p.createdAt desc
    """)
    List<Post> findByAuthorIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("""
        select p from Post p
        join fetch p.author
        where p.author.id = :userId
        order by p.createdAt desc
    """)
    Page<Post> findByAuthorIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);

    @Query("""
        select p from Post p
        join fetch p.author
        where p.author.id = :userId
          and p.published = true
          and p.hiddenByAdmin = false
        order by p.createdAt desc
    """)
    List<Post> findVisibleByAuthorIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("""
        select p from Post p
        join fetch p.author
        where p.author.id = :userId
          and p.published = true
          and p.hiddenByAdmin = false
        order by p.createdAt desc
    """)
    Page<Post> findVisibleByAuthorIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);

    @Query("""
        select p from Post p
        join fetch p.author
        where p.id = :id
    """)
    Optional<Post> findWithAuthorById(@Param("id") Long id);

    @Query("""
        select p from Post p
        join fetch p.author
        where p.id = :id
          and p.published = true
          and p.hiddenByAdmin = false
    """)
    Optional<Post> findVisibleById(@Param("id") Long id);

    long countByAuthorId(Long authorId);

    @Query("""
        select p.author.id, count(p.id)
        from Post p
        where p.author.id in :authorIds
        group by p.author.id
    """)
    List<Object[]> countByAuthorIds(@Param("authorIds") Collection<Long> authorIds);

    @Query("""
        select p from Post p
        join fetch p.author
        where p.author.id in :authorIds
          and p.published = true
          and p.hiddenByAdmin = false
        order by p.createdAt desc
    """)
    List<Post> findVisibleByAuthorIdsOrderByCreatedAtDesc(@Param("authorIds") List<Long> authorIds);

    @Query("""
        select p from Post p
        join fetch p.author
        where p.author.id in :authorIds
          and p.published = true
          and p.hiddenByAdmin = false
        order by p.createdAt desc
    """)
    Page<Post> findVisibleByAuthorIdsOrderByCreatedAtDesc(@Param("authorIds") List<Long> authorIds, Pageable pageable);

    @Query("""
        select p from Post p
        join fetch p.author
        order by p.createdAt desc
    """)
    List<Post> findAllWithAuthorOrderByCreatedAtDesc();
}
