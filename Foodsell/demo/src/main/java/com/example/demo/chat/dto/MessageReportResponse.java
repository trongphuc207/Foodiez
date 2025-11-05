package com.example.demo.chat.dto;

import java.time.LocalDateTime;

public class MessageReportResponse {
    private Long id;
    private Long messageId;
    private Integer reporterId;
    private String reason;
    private LocalDateTime createdAt;

    public MessageReportResponse() {}

    public MessageReportResponse(Long id, Long messageId, Integer reporterId, String reason, LocalDateTime createdAt) {
        this.id = id;
        this.messageId = messageId;
        this.reporterId = reporterId;
        this.reason = reason;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getMessageId() { return messageId; }
    public Integer getReporterId() { return reporterId; }
    public String getReason() { return reason; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setMessageId(Long messageId) { this.messageId = messageId; }
    public void setReporterId(Integer reporterId) { this.reporterId = reporterId; }
    public void setReason(String reason) { this.reason = reason; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

