package com.example.demo.Shipper;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shippers")
public class Shipper {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "vehicle_type")
    private String vehicleType; // xe máy, xe đạp, ô tô

    @Column(name = "license_plate")
    private String licensePlate;

    @Column(name = "delivery_area")
    private String deliveryArea; // khu vực giao hàng

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "rating")
    private Integer rating = 0;

    @Column(name = "total_deliveries")
    private Integer totalDeliveries = 0;

    @Column(name = "total_earnings")
    private Double totalEarnings = 0.0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Constructors
    public Shipper() {}

    public Shipper(Integer userId, String vehicleType, String licensePlate, String deliveryArea) {
        this.userId = userId;
        this.vehicleType = vehicleType;
        this.licensePlate = licensePlate;
        this.deliveryArea = deliveryArea;
    }

    // Getters & Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public String getDeliveryArea() { return deliveryArea; }
    public void setDeliveryArea(String deliveryArea) { this.deliveryArea = deliveryArea; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public Integer getTotalDeliveries() { return totalDeliveries; }
    public void setTotalDeliveries(Integer totalDeliveries) { this.totalDeliveries = totalDeliveries; }

    public Double getTotalEarnings() { return totalEarnings; }
    public void setTotalEarnings(Double totalEarnings) { this.totalEarnings = totalEarnings; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
