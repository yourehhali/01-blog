package com.blog.main.repository;

import com.blog.main.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("""
        select u from User u
        where lower(u.username) like lower(concat('%', :username, '%'))
        order by u.createdAt desc
    """)
    List<User> searchByUsername(@Param("username") String username);

    long countByActiveTrue();

    default List<User> findAllByCreatedAtDesc() {
        return findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @Query("""
        select u from User u
        where lower(u.username) like lower(concat('%', :username, '%'))
        order by u.createdAt desc
    """)
    Page<User> searchByUsername(@Param("username") String username, Pageable pageable);
}
