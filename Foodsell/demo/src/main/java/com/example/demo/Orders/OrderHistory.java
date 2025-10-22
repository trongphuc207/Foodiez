package com.example.demo.Orders;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "order_id", nullable = false)
    private Integer orderId;

    @Column(name = "status_from")
    private String statusFrom;

    @Column(name = "status_to", nullable = false)
    private String statusTo;

    @Column(name = "action", nullable = false)
    private String action; // payment_success, payment_failed, order_cancelled, etc.

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "created_by")
    private String createdBy; // system, user_id, admin_id

    // Constructor for creating new order history
    public OrderHistory(Integer orderId, String statusFrom, String statusTo, 
                       String action, String description, String createdBy) {
        this.orderId = orderId;
        this.statusFrom = statusFrom;
        this.statusTo = statusTo;
        this.action = action;
        this.description = description;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
    }

    // Auto set createdAt when persisting
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
