package com.example.demo.notification;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false) 
    private Long userId;
    
    @Column(name = "user_role", nullable = false) 
    private String userRole; // buyer, seller, admin, shipper
    
    @Column(nullable = false) 
    private String type;   // ORDER_STATUS | REVIEW | SYSTEM | PROMOTION | DELIVERY...
    
    @Column(nullable = true) 
    private String title;
    
    @Column(columnDefinition = "NVARCHAR(MAX)") 
    private String message;
    
    @Column(name = "is_read") 
    private Boolean isRead = false;
    
    @Column(name = "created_at") 
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at") 
    private LocalDateTime updatedAt;
    
    @Column(name = "related_id") 
    private Long relatedId; // ID của order, product, etc.
    
    @Column(name = "related_type") 
    private String relatedType; // ORDER, PRODUCT, REVIEW, etc.
    
    @Column(name = "priority") 
    private String priority = "NORMAL"; // LOW, NORMAL, HIGH, URGENT

    @PrePersist 
    void onCreate(){ 
        createdAt = LocalDateTime.now(); 
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Notification() {}
    
    public Notification(Long userId, String userRole, String type, String title, String message) {
        this.userId = userId;
        this.userRole = userRole;
        this.type = type;
        this.title = title;
        this.message = message;
    }

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean read) { isRead = read; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Long getRelatedId() { return relatedId; }
    public void setRelatedId(Long relatedId) { this.relatedId = relatedId; }
    
    public String getRelatedType() { return relatedType; }
    public void setRelatedType(String relatedType) { this.relatedType = relatedType; }
    
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}
