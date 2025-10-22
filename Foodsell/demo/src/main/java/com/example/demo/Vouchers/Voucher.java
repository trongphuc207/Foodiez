package com.example.demo.Vouchers;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "code", unique = true, nullable = false)
    private String code;

    @Column(name = "discount_type", nullable = false)
    private String discountType; // 'percentage' or 'fixed'

    @Column(name = "discount_value", nullable = false, precision = 5, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "min_order_value", precision = 10, scale = 2)
    private BigDecimal minOrderValue;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;

    @Column(name = "created_by", nullable = false)
    private Integer createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Constructor for creating vouchers
    public Voucher(String code, String discountType, BigDecimal discountValue, 
                   BigDecimal minOrderValue, LocalDate expiryDate, Integer maxUses, Integer createdBy) {
        this.code = code;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.minOrderValue = minOrderValue;
        this.expiryDate = expiryDate;
        this.maxUses = maxUses;
        this.createdBy = createdBy;
        this.usedCount = 0;
        this.isActive = true;
        this.createdAt = LocalDateTime.now();
    }

    // Check if voucher is valid
    public boolean isValid() {
        return isActive && 
               LocalDate.now().isBefore(expiryDate) && 
               (maxUses == null || usedCount < maxUses);
    }

    // Calculate discount amount
    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        if (!isValid() || orderAmount.compareTo(minOrderValue) < 0) {
            return BigDecimal.ZERO;
        }

        if ("percentage".equals(discountType)) {
            return orderAmount.multiply(discountValue).divide(BigDecimal.valueOf(100));
        } else {
            return discountValue.min(orderAmount);
        }
    }
}

