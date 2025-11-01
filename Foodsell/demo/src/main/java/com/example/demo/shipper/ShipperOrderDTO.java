package com.example.demo.shipper;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ShipperOrderDTO {
    private String id;
    private String customer;
    private String phone;
    private String status;
    private LocalDateTime time;
    private String pickupAddress;
    private String deliveryAddress;
    private int items;
    private String distance;
    private String price;
    private String note;
}