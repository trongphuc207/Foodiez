package com.example.demo.Shipper;

import lombok.Data;

@Data
public class OrderStatusUpdateRequest {
    private String status;
    private String note;
}