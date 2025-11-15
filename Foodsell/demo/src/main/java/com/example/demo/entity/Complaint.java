package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "complaints")
@Data
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "complaint_number", unique = true, length = 20)
    private String complaintNumber;

    @Column(name = "complainant_id", nullable = false)
    private Long complainantId;

    @Column(name = "complainant_type", nullable = false, length = 20)
    private String complainantType; // customer, seller, shipper

    @Column(name = "respondent_id")
    private Long respondentId;

    @Column(name = "respondent_type", length = 20)
    private String respondentType; // customer, seller, shipper, admin, system

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 200)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(length = 20)
    private String status = "pending"; // pending, under_review, resolved, rejected

    @Column(length = 20)
    private String priority = "normal"; // low, normal, high, urgent

    // Admin handling
    @Column(name = "assigned_admin_id")
    private Long assignedAdminId;

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    @Column(name = "admin_decision", length = 20)
    private String adminDecision; // approved, rejected, needs_more_info

    @Column(name = "decision_reason", columnDefinition = "TEXT")
    private String decisionReason;

    // Related entities
    @Column(name = "related_order_id")
    private Long relatedOrderId;

    @Column(name = "related_product_id")
    private Long relatedProductId;

    // Timestamps
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    // Relationships
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ComplaintImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ComplaintResponse> responses = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "pending";
        }
        if (priority == null) {
            priority = "normal";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public void addImage(ComplaintImage image) {
        images.add(image);
        image.setComplaint(this);
    }

    public void removeImage(ComplaintImage image) {
        images.remove(image);
        image.setComplaint(null);
    }

    public void addResponse(ComplaintResponse response) {
        responses.add(response);
        response.setComplaint(this);
    }
}
