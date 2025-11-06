package com.example.demo.shipper;

import lombok.Data;

@Data
public class ShipperEarningsDTO {
    private String dailyEarnings;
    private String weeklyEarnings;
    private String monthlyEarnings;
    private int completedOrders;
    private double averageRating;
}