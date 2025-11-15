package com.example.demo.notifications;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @Column(name = "type", nullable = false, length = 50)
    private String type; // ORDER, PROMOTION, MESSAGE, DELIVERY, SYSTEM
    
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    // Constructors
    public Notification() {}
    
    public Notification(Integer userId, String type, String title, String message) {
        // Normalize type ngay trong constructor để đảm bảo consistency
        // Database CHECK constraint cho phép: ORDER, PROMOTION, MESSAGE, DELIVERY, SYSTEM
        String normalizedType = (type != null) ? type.toUpperCase().trim() : "SYSTEM";
        java.util.Set<String> validTypes = java.util.Set.of("ORDER", "PROMOTION", "MESSAGE", "DELIVERY", "SYSTEM");
        if (!validTypes.contains(normalizedType)) {
            System.out.println("⚠️ Notification constructor: Invalid type '" + type + "' mapped to SYSTEM");
            normalizedType = "SYSTEM";
        }
        
        this.userId = userId;
        this.type = normalizedType; // Sử dụng normalized type
        this.title = title;
        this.message = message;
        this.isRead = false;
        this.createdAt = LocalDateTime.now();
        
        System.out.println("📢 Notification created with type: " + this.type + " (original: " + type + ")");
    }
    
    // Getters and Setters
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Boolean getIsRead() {
        return isRead;
    }
    
    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}