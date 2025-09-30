package com.example.demo.products;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String description;
    private double price;

    @Column(name = "is_available")
    private boolean available;

    @Column(name = "image_url")
    private String imageUrl;

    private String status;

    // NEW
    @Column(name = "shop_id")
    private int shopId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Auto set khi insert/update
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
