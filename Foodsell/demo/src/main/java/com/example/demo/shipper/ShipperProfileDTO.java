package com.example.demo.shipper;

import lombok.Data;

@Data
public class ShipperProfileDTO {
    private Long id;
    private String name;
    private String phone;
    private String vehicleType;
    private String licensePlate;
    private String deliveryArea;
    private Boolean isAvailable;
    private Double rating;
    private Integer totalDeliveries;
    private Double totalEarnings;
}