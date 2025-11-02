package com.example.demo.shop;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.io.Serializable;

// Keep as a simple DTO; canonical JPA entity is in com.example.demo.shops.Shop
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Shop implements Serializable {
    private Integer id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
}