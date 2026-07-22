package com.blog.main.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "posts",
        indexes = {
                @Index(name = "idx_posts_published_hidden_created", columnList = "published, hidden_by_admin, created_at"),
                @Index(name = "idx_posts_author_created", columnList = "author_id, created_at"),
                @Index(name = "idx_posts_hidden_created", columnList = "hidden_by_admin, created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false)
    private boolean published = false;

    @Column(name = "hidden_by_admin", nullable = false)
    private boolean hiddenByAdmin = false;

    @ElementCollection
    @CollectionTable(
            name = "post_media_urls",
            joinColumns = @JoinColumn(name = "post_id"),
            indexes = @Index(name = "idx_post_media_post", columnList = "post_id")
    )
    @Column(name = "media_url", nullable = false)
    private List<String> mediaUrls = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
