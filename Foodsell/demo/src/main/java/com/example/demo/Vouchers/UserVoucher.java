package com.example.demo.Vouchers;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_vouchers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserVoucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "voucher_id", nullable = false)
    private Integer voucherId;

    // Relationship với Voucher
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "voucher_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Voucher voucher;

    @Column(name = "is_used", nullable = false)
    private Boolean isUsed = false;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "claimed_at", nullable = false)
    private LocalDateTime claimedAt = LocalDateTime.now();

    @Column(name = "order_id")
    private Integer orderId; // Order sử dụng voucher này

    // Constructor for claiming voucher
    public UserVoucher(Integer userId, Integer voucherId) {
        this.userId = userId;
        this.voucherId = voucherId;
        this.isUsed = false;
        this.claimedAt = LocalDateTime.now();
    }

    // Mark voucher as used
    public void markAsUsed(Integer orderId) {
        this.isUsed = true;
        this.usedAt = LocalDateTime.now();
        this.orderId = orderId;
    }
}


