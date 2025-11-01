package com.example.demo.favorites;

import lombok.Data;

@Data
public class FavoriteProductDTO {
    private int id;
    private String name;
    private String description;
    private double price;
    private String imageUrl;
    private String shopName;
    private boolean available;
    
    // Constructor
    public FavoriteProductDTO(int id, String name, String description, double price, 
                            String imageUrl, String shopName, boolean available) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.shopName = shopName;
        this.available = available;
    }
}