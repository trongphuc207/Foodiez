package com.example.demo.chat.dto;

import java.time.LocalDateTime;

public class AdminMessageLogDTO {
    private Long id;
    private Long conversationId;
    private Integer senderId;
    private String senderName;
    private String senderEmail;
    private String content;
    private String imageUrl;
    private LocalDateTime createdAt;
    private boolean reported;
    private String reportReason;
    private LocalDateTime reportCreatedAt;

    public AdminMessageLogDTO(Long id,
                              Long conversationId,
                              Integer senderId,
                              String senderName,
                              String senderEmail,
                              String content,
                              String imageUrl,
                              LocalDateTime createdAt,
                              boolean reported,
                              String reportReason,
                              LocalDateTime reportCreatedAt) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderEmail = senderEmail;
        this.content = content;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
        this.reported = reported;
        this.reportReason = reportReason;
        this.reportCreatedAt = reportCreatedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public Integer getSenderId() {
        return senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public String getContent() {
        return content;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean isReported() {
        return reported;
    }

    public String getReportReason() {
        return reportReason;
    }

    public LocalDateTime getReportCreatedAt() {
        return reportCreatedAt;
    }
}

