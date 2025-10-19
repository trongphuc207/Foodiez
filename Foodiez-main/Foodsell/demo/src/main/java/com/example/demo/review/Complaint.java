package com.example.demo.review;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "review_id", nullable = false)
    private Integer reviewId;
    
    @Column(name = "complaint_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ComplaintType complaintType;
    
    @Column(name = "complaint_reason", nullable = false, columnDefinition = "NVARCHAR(1000)")
    private String complaintReason;
    
    @Column(name = "complaint_details", columnDefinition = "NVARCHAR(2000)")
    private String complaintDetails;
    
    @Column(name = "reporter_id", nullable = false)
    private Integer reporterId;
    
    @Column(name = "reporter_name", columnDefinition = "NVARCHAR(255)")
    private String reporterName;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ComplaintStatus status = ComplaintStatus.PENDING;
    
    @Column(name = "admin_notes", columnDefinition = "NVARCHAR(1000)")
    private String adminNotes;
    
    @Column(name = "resolution", columnDefinition = "NVARCHAR(1000)")
    private String resolution;
    
    @Column(name = "resolved_by")
    private Integer resolvedBy;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Enums
    public enum ComplaintType {
        INAPPROPRIATE_CONTENT("Nội dung không phù hợp"),
        FAKE_REVIEW("Đánh giá giả mạo"),
        SPAM("Spam"),
        HARASSMENT("Quấy rối"),
        COPYRIGHT_VIOLATION("Vi phạm bản quyền"),
        OTHER("Khác");
        
        private final String description;
        
        ComplaintType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    public enum ComplaintStatus {
        PENDING("Chờ xử lý"),
        UNDER_REVIEW("Đang xem xét"),
        RESOLVED("Đã giải quyết"),
        REJECTED("Từ chối"),
        CLOSED("Đóng");
        
        private final String description;
        
        ComplaintStatus(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    // Constructors
    public Complaint() {}
    
    public Complaint(Integer reviewId, ComplaintType complaintType, String complaintReason, 
                    Integer reporterId, String reporterName) {
        this.reviewId = reviewId;
        this.complaintType = complaintType;
        this.complaintReason = complaintReason;
        this.reporterId = reporterId;
        this.reporterName = reporterName;
        this.status = ComplaintStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // JPA Callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    
    public Integer getReviewId() { return reviewId; }
    public void setReviewId(Integer reviewId) { this.reviewId = reviewId; }
    
    public ComplaintType getComplaintType() { return complaintType; }
    public void setComplaintType(ComplaintType complaintType) { this.complaintType = complaintType; }
    
    public String getComplaintReason() { return complaintReason; }
    public void setComplaintReason(String complaintReason) { this.complaintReason = complaintReason; }
    
    public String getComplaintDetails() { return complaintDetails; }
    public void setComplaintDetails(String complaintDetails) { this.complaintDetails = complaintDetails; }
    
    public Integer getReporterId() { return reporterId; }
    public void setReporterId(Integer reporterId) { this.reporterId = reporterId; }
    
    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }
    
    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }
    
    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
    
    public String getResolution() { return resolution; }
    public void setResolution(String resolution) { this.resolution = resolution; }
    
    public Integer getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(Integer resolvedBy) { this.resolvedBy = resolvedBy; }
    
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
