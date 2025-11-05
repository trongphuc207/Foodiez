package com.example.demo.reviews;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "customer_id", nullable = false)
    private Integer customerId;

    @Column(name = "product_id", nullable = false)
    private Integer productId;

    @Column(name = "shop_id", nullable = false)
    private Integer shopId;

    @Column(name = "order_id", nullable = true)
    private Integer orderId;

    @Column(name = "rating", nullable = false)
    private Integer rating; // 1-5 stars

    @Column(name = "content", columnDefinition = "NVARCHAR(MAX)")
    private String content;

    @Column(name = "is_visible", nullable = false)
    private Boolean isVisible = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Constructor for creating new reviews
    public Review(Integer customerId, Integer productId, Integer shopId, Integer orderId, 
                  Integer rating, String content) {
        this.customerId = customerId;
        this.productId = productId;
        this.shopId = shopId;
        this.orderId = orderId;
        this.rating = rating;
        this.content = content;
        this.isVisible = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
