package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_responses")
@Data
public class ComplaintResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    @JsonBackReference
    private Complaint complaint;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_role", nullable = false, length = 20)
    private String userRole; // admin, customer, seller, shipper

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "is_internal_note")
    private Boolean isInternalNote = false; // Only visible to admins

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isInternalNote == null) {
            isInternalNote = false;
        }
    }
}
