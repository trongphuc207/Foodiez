package com.example.demo.Orders;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "status", nullable = false)
    private String status = "pending";

    @Column(name = "voucher_id")
    private Integer voucherId;

    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    @Column(name = "recipient_name")
    private String recipientName;

    @Column(name = "recipient_phone")
    private String recipientPhone;

    @Column(name = "address_text", columnDefinition = "NVARCHAR(MAX)")
    private String addressText;

    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // One-to-many relationship with OrderItem
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems;

    // Constructor for creating new orders
    public Order(Integer buyerId, Integer shopId, Integer deliveryAddressId,
            BigDecimal totalAmount, String status, String notes) {
        this.buyerId = buyerId;
        this.shopId = shopId;
        this.deliveryAddressId = deliveryAddressId;
        this.totalAmount = totalAmount;
        this.status = status;
        this.notes = notes;
        this.createdAt = LocalDateTime.now();
    }

    // Constructor with voucher
    public Order(Integer buyerId, Integer shopId, Integer deliveryAddressId,
            BigDecimal totalAmount, String status, Integer voucherId, String notes) {
        this.buyerId = buyerId;
        this.shopId = shopId;
        this.deliveryAddressId = deliveryAddressId;
        this.totalAmount = totalAmount;
        this.status = status;
        this.voucherId = voucherId;
        this.notes = notes;
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
