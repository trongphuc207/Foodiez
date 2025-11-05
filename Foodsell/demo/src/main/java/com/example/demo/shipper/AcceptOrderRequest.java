package com.example.demo.shipper;

import lombok.Data;

@Data
public class AcceptOrderRequest {
    private Integer orderId;
    private String note;
}