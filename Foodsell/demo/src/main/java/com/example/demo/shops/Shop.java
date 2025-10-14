package com.example.demo.shops;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "shops")
@Data
public class Shop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "seller_id", nullable = false, unique = true)
    private int sellerId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "opening_hours")
    private String openingHours;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Default constructor
    public Shop() {}

    // Constructor for creating new shop
    public Shop(int sellerId, String name, String description, String address, String openingHours) {
        this.sellerId = sellerId;
        this.name = name;
        this.description = description;
        this.address = address;
        this.openingHours = openingHours;
        this.rating = null;
    }

    // Auto set created_at when inserting
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}