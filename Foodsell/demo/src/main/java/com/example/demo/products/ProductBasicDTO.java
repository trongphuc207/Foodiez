package com.example.demo.products;

public class ProductBasicDTO {
    private Integer id;
    private Integer shopId;
    private String name;
    private Double price;
    private String imageUrl;
    private String status;

    // Constructors
    public ProductBasicDTO() {}

    public ProductBasicDTO(Integer id, Integer shopId, String name, Double price, String imageUrl, String status) {
        this.id = id;
        this.shopId = shopId;
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl;
        this.status = status;
    }

    // Static factory method to create from Product entity
    public static ProductBasicDTO fromProduct(Product product) {
        return new ProductBasicDTO(
            product.getId(),
            product.getShopId(),
            product.getName(),
            product.getPrice(),
            product.getImageUrl(),
            product.getStatus()
        );
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getShopId() {
        return shopId;
    }

    public void setShopId(Integer shopId) {
        this.shopId = shopId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}