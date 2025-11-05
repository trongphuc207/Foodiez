package com.example.demo.Shipper;

import lombok.Data;

@Data
public class AcceptOrderRequest {
    private Integer orderId;
    private String note;
}