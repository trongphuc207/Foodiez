package com.example.demo.dto;

import com.example.demo.products.Product;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteProductDTO {
    private int id;
    private String name;
    private String description;
    private double price;
    private String imageUrl;
    private boolean available;
    private String status;
    private String shopName;

    public static FavoriteProductDTO fromProduct(Product product) {
        FavoriteProductDTO dto = new FavoriteProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setImageUrl(product.getImageUrl());
        dto.setAvailable(product.isAvailable());
        dto.setStatus(product.getStatus());
        // TODO: Set shop name when shop service is available
        dto.setShopName("Shop #" + product.getShopId());
        return dto;
    }
}