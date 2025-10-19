package com.example.demo.review.dto;

import com.example.demo.review.Review;
import java.time.LocalDateTime;

public class ReviewResponse {
    private Integer id;
    private Integer productId;
    private Integer shopId;
    private Integer userId;
    private String userName;
    private Integer rating;
    private String comment;
    private String imageUrl;
    private Boolean isVerified;
    private String status;
    private String merchantReply;
    private LocalDateTime merchantReplyAt;
    
    // Complaint fields
    private Integer complaintCount;
    private LocalDateTime lastComplaintAt;
    private String complaintStatus;
    private String adminComplaintNotes;
    private String complaintResolution;
    private Integer complaintResolvedBy;
    private LocalDateTime complaintResolvedAt;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public ReviewResponse() {}

    public ReviewResponse(Review review) {
        this.id = review.getId();
        this.productId = review.getProductId();
        this.shopId = review.getShopId();
        this.userId = review.getUserId();
        this.userName = review.getUserName();
        this.rating = review.getRating();
        this.comment = review.getComment();
        this.imageUrl = review.getImageUrl();
        this.isVerified = review.getIsVerified();
        this.status = review.getStatus().name();
        this.merchantReply = review.getMerchantReply();
        this.merchantReplyAt = review.getMerchantReplyAt();
        
        // Complaint fields
        this.complaintCount = review.getComplaintCount();
        this.lastComplaintAt = review.getLastComplaintAt();
        this.complaintStatus = review.getComplaintStatus() != null ? review.getComplaintStatus().name() : null;
        this.adminComplaintNotes = review.getAdminComplaintNotes();
        this.complaintResolution = review.getComplaintResolution();
        this.complaintResolvedBy = review.getComplaintResolvedBy();
        this.complaintResolvedAt = review.getComplaintResolvedAt();
        
        this.createdAt = review.getCreatedAt();
        this.updatedAt = review.getUpdatedAt();
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getProductId() { return productId; }
    public void setProductId(Integer productId) { this.productId = productId; }

    public Integer getShopId() { return shopId; }
    public void setShopId(Integer shopId) { this.shopId = shopId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMerchantReply() { return merchantReply; }
    public void setMerchantReply(String merchantReply) { this.merchantReply = merchantReply; }

    public LocalDateTime getMerchantReplyAt() { return merchantReplyAt; }
    public void setMerchantReplyAt(LocalDateTime merchantReplyAt) { this.merchantReplyAt = merchantReplyAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Complaint getters and setters
    public Integer getComplaintCount() { return complaintCount; }
    public void setComplaintCount(Integer complaintCount) { this.complaintCount = complaintCount; }

    public LocalDateTime getLastComplaintAt() { return lastComplaintAt; }
    public void setLastComplaintAt(LocalDateTime lastComplaintAt) { this.lastComplaintAt = lastComplaintAt; }

    public String getComplaintStatus() { return complaintStatus; }
    public void setComplaintStatus(String complaintStatus) { this.complaintStatus = complaintStatus; }

    public String getAdminComplaintNotes() { return adminComplaintNotes; }
    public void setAdminComplaintNotes(String adminComplaintNotes) { this.adminComplaintNotes = adminComplaintNotes; }

    public String getComplaintResolution() { return complaintResolution; }
    public void setComplaintResolution(String complaintResolution) { this.complaintResolution = complaintResolution; }

    public Integer getComplaintResolvedBy() { return complaintResolvedBy; }
    public void setComplaintResolvedBy(Integer complaintResolvedBy) { this.complaintResolvedBy = complaintResolvedBy; }

    public LocalDateTime getComplaintResolvedAt() { return complaintResolvedAt; }
    public void setComplaintResolvedAt(LocalDateTime complaintResolvedAt) { this.complaintResolvedAt = complaintResolvedAt; }
}
