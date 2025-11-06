package com.example.demo.shipper;

import lombok.Data;

@Data
public class ShipperDashboardDTO {
    private int totalOrders;
    private int deliveredOrders;
    private int deliveringOrders;
    private String totalEarnings;
}