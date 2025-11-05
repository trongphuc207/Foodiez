package com.example.demo.Shipper;

import lombok.Data;

@Data
public class ShipperDashboardDTO {
    private int totalOrders;
    private int deliveredOrders;
    private int deliveringOrders;
    private String totalEarnings;
}