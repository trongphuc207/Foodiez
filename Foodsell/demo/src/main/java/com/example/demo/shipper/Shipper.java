package com.example.demo.shipper;

import jakarta.persistence.*;
import lombok.*;
import com.example.demo.Users.User;
import java.time.LocalDateTime;

@Entity
@Table(name = "shippers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipper {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "is_available")
    private Boolean isAvailable;

    private Double rating;

    @Column(name = "total_deliveries")
    private Integer totalDeliveries;

    @Column(name = "total_earnings")
    private Double totalEarnings;

    @Column(name = "delivery_area")
    private String deliveryArea;

    @Column(name = "vehicle_type")
    private String vehicleType;

    @Column(name = "license_plate")
    private String licensePlate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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