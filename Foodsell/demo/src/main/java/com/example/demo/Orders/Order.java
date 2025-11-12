package com.example.demo.Orders;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.example.demo.shops.Shop;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "buyer_id", nullable = false)
    private Integer buyerId;

    @Column(name = "shop_id", nullable = false)
    private Integer shopId;

    @Column(name = "delivery_address_id", nullable = false)
    private Integer deliveryAddressId;

    @Column(name = "total_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalAmount;

    @Column(name = "status", nullable = false)
    private String status = "pending";

    @Column(name = "voucher_id")
    private Integer voucherId;

    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    @Column(name = "order_code")
    private Integer orderCode;

    @Column(name = "recipient_name")
    private String recipientName;

    @Column(name = "recipient_phone")
    private String recipientPhone;
    
    @Column(name = "delivery_fee")
    private Double deliveryFee;
    
    @Column(name = "assigned_shipper_id")
    private Integer assignedShipperId;
    
    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;
    
    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;
    
    @Column(name = "address_text", columnDefinition = "NVARCHAR(MAX)")
    private String addressText;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shop_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Shop shop;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_cancelled")
    private Boolean isCancelled = false;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancelled_by")
    private Integer cancelledBy;

    @Column(name = "cancel_reason", columnDefinition = "NVARCHAR(MAX)")
    private String cancelReason;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Thêm các trường cho hệ thống phân phối đơn hàng
    @Column(name = "assigned_seller_id")
    private Integer assignedSellerId;

    @Column(name = "assignment_status")
    private String assignmentStatus = "pending"; // pending, assigned, accepted, rejected

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    // One-to-many relationship with OrderItem
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems;

    // Auto set createdAt when persisting
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Auto set updatedAt when updating
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public Double getDeliveryFee() {
        return deliveryFee;
    }

}
