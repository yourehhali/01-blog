package com.rox.blog.user;

import jakarta.persistence.*;

@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;
    private String password;


    // Default constructor for JPA
    public User() {
    }
    // Constructor for creating new users
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
}