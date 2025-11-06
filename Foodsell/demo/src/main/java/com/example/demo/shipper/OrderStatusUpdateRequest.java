package com.example.demo.shipper;

import lombok.Data;

@Data
public class OrderStatusUpdateRequest {
    private String status;
    private String note;
}