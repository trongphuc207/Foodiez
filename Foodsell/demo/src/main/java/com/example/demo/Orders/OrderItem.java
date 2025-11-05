package com.example.demo.Orders;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "order_id")
    private Integer orderId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;
    
    @Column(name = "product_id")
    private Integer productId;
    
    @Column(name = "quantity")
    private Integer quantity;
    
    @Column(name = "unit_price", precision = 19, scale = 2)
    private BigDecimal unitPrice;
    
    // Transient field - not stored in database, calculated on-the-fly
    @Transient
    private BigDecimal totalPrice;
    
    @PostLoad
    @PostPersist
    @PostUpdate
    private void calculateTotalPrice() {
        if (unitPrice != null && quantity != null) {
            totalPrice = unitPrice.multiply(new BigDecimal(quantity));
        }
    }
    
    // Getter for totalPrice (if not using Lombok @Data)
    public BigDecimal getTotalPrice() {
        if (totalPrice == null && unitPrice != null && quantity != null) {
            totalPrice = unitPrice.multiply(new BigDecimal(quantity));
        }
        return totalPrice;
    }
}

