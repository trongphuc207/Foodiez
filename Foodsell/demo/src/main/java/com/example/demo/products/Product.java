package com.example.demo.products;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String description;
    private double price;

    @Column(name = "is_available")
    private boolean available;

    @Column(name = "image_url")
    private String imageUrl;

    private String status;
}