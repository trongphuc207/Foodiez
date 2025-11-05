package com.example.demo.Shipper;

import lombok.Data;

@Data
public class ShipperEarningsDTO {
    private String dailyEarnings;
    private String weeklyEarnings;
    private String monthlyEarnings;
    private int completedOrders;
    private double averageRating;
}