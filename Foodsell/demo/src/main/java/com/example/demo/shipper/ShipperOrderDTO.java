package com.example.demo.Shipper;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ShipperOrderDTO {
    private String id;
    private String customer;
    private String phone;
    private String status;
    private String assignmentStatus;
    private Integer assignedShipperId;
    private LocalDateTime time;
    private String pickupAddress;
    private String deliveryAddress;
    private int items;
    private String distance;
    private String price;
    private String note;
}