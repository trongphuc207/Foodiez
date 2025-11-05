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
    @Column(name = "id")
    private int id;

    @Column(name = "shop_id")
    private int shopId;

    @Column(name = "category_id")
    private int categoryId;

    @Column(name = "name")
    private String name;
    
    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;
    
    @Column(name = "price")
    private double price;

    @Column(name = "is_available")
    private boolean available;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Default constructor
    public Product() {}

    // Constructor for sample data
    public Product(int shopId, int categoryId, String name, String description, double price, boolean available, String imageUrl, String status) {
        this.shopId = shopId;
        this.categoryId = categoryId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.available = available;
        this.imageUrl = imageUrl;
        this.status = status;
    }

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
