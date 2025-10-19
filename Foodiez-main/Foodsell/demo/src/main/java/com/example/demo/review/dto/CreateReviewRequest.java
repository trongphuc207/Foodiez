package com.example.demo.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateReviewRequest {
    @NotNull(message = "Product ID không được để trống")
    private Integer productId;

    @NotNull(message = "Shop ID không được để trống")
    private Integer shopId;

    @NotNull(message = "Rating không được để trống")
    @Min(value = 1, message = "Rating phải từ 1 đến 5")
    @Max(value = 5, message = "Rating phải từ 1 đến 5")
    private Integer rating;

    @Size(max = 1000, message = "Comment không được quá 1000 ký tự")
    private String comment;

    private String imageUrl;
    private Integer orderId; // Optional - để xác thực mua hàng

    // Constructors
    public CreateReviewRequest() {}

    public CreateReviewRequest(Integer productId, Integer shopId, Integer rating, String comment) {
        this.productId = productId;
        this.shopId = shopId;
        this.rating = rating;
        this.comment = comment;
    }

    // Getters and Setters
    public Integer getProductId() { return productId; }
    public void setProductId(Integer productId) { this.productId = productId; }

    public Integer getShopId() { return shopId; }
    public void setShopId(Integer shopId) { this.shopId = shopId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getOrderId() { return orderId; }
    public void setOrderId(Integer orderId) { this.orderId = orderId; }
}
