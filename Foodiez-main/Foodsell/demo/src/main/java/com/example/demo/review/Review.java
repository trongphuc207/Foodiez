package com.example.demo.review;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "order_id")
    private Integer orderId; // nullable - để xác thực mua hàng

    @NotNull 
    @Column(name = "product_id")
    private Integer productId;

    @NotNull 
    @Column(name = "shop_id")
    private Integer shopId;

    @NotNull 
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "user_name")
    private String userName; // Tên người dùng để hiển thị

    @NotNull 
    @Min(1) 
    @Max(5)
    private Integer rating;

    @Size(max = 1000, message = "Comment không được quá 1000 ký tự")
    @Column(columnDefinition = "NVARCHAR(1000)")
    private String comment;

    @Column(name = "image_url") 
    private String imageUrl;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false; // Đánh giá đã được xác thực mua hàng

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ReviewStatus status = ReviewStatus.ACTIVE;

    @Column(name = "merchant_reply", columnDefinition = "NVARCHAR(1000)")
    private String merchantReply;

    @Column(name = "merchant_reply_at")
    private LocalDateTime merchantReplyAt;

    // Complaint fields
    @Column(name = "complaint_count", nullable = false)
    private Integer complaintCount = 0; // Số lượng khiếu nại

    @Column(name = "last_complaint_at")
    private LocalDateTime lastComplaintAt; // Thời gian khiếu nại cuối cùng

    @Column(name = "complaint_status")
    @Enumerated(EnumType.STRING)
    private ComplaintStatus complaintStatus = ComplaintStatus.NONE; // Trạng thái khiếu nại

    @Column(name = "admin_complaint_notes", columnDefinition = "NVARCHAR(1000)")
    private String adminComplaintNotes; // Ghi chú admin về khiếu nại

    @Column(name = "complaint_resolution", columnDefinition = "NVARCHAR(1000)")
    private String complaintResolution; // Giải pháp xử lý khiếu nại

    @Column(name = "complaint_resolved_by")
    private Integer complaintResolvedBy; // Admin đã giải quyết

    @Column(name = "complaint_resolved_at")
    private LocalDateTime complaintResolvedAt; // Thời gian giải quyết

    @Column(name = "created_at") 
    private LocalDateTime createdAt;

    @Column(name = "updated_at") 
    private LocalDateTime updatedAt;

    @PrePersist 
    void onCreate() { 
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Review() {}

    public Review(Integer productId, Integer shopId, Integer userId, String userName, Integer rating, String comment) {
        this.productId = productId;
        this.shopId = shopId;
        this.userId = userId;
        this.userName = userName;
        this.rating = rating;
        this.comment = comment;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getOrderId() { return orderId; }
    public void setOrderId(Integer orderId) { this.orderId = orderId; }

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

    public ReviewStatus getStatus() { return status; }
    public void setStatus(ReviewStatus status) { this.status = status; }

    public String getMerchantReply() { return merchantReply; }
    public void setMerchantReply(String merchantReply) { 
        this.merchantReply = merchantReply;
        this.merchantReplyAt = LocalDateTime.now();
    }

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

    public ComplaintStatus getComplaintStatus() { return complaintStatus; }
    public void setComplaintStatus(ComplaintStatus complaintStatus) { this.complaintStatus = complaintStatus; }

    public String getAdminComplaintNotes() { return adminComplaintNotes; }
    public void setAdminComplaintNotes(String adminComplaintNotes) { this.adminComplaintNotes = adminComplaintNotes; }

    public String getComplaintResolution() { return complaintResolution; }
    public void setComplaintResolution(String complaintResolution) { this.complaintResolution = complaintResolution; }

    public Integer getComplaintResolvedBy() { return complaintResolvedBy; }
    public void setComplaintResolvedBy(Integer complaintResolvedBy) { this.complaintResolvedBy = complaintResolvedBy; }

    public LocalDateTime getComplaintResolvedAt() { return complaintResolvedAt; }
    public void setComplaintResolvedAt(LocalDateTime complaintResolvedAt) { this.complaintResolvedAt = complaintResolvedAt; }

    // Enum for Review Status
    public enum ReviewStatus {
        ACTIVE,     // Đánh giá hoạt động bình thường
        HIDDEN,     // Ẩn bởi admin
        DELETED     // Đã xóa
    }

    // Enum for Complaint Status
    public enum ComplaintStatus {
        NONE,           // Không có khiếu nại
        PENDING,        // Có khiếu nại chờ xử lý
        UNDER_REVIEW,   // Đang xem xét khiếu nại
        RESOLVED,       // Đã giải quyết khiếu nại
        REJECTED        // Từ chối khiếu nại
    }
}
