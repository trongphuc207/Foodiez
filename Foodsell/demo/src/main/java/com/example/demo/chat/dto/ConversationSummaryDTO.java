package com.example.demo.chat.dto;

import java.time.LocalDateTime;

public class ConversationSummaryDTO {
    private Long id;
    private String title;
    private LocalDateTime updatedAt;
    private Long unreadCount;

    public ConversationSummaryDTO() {}

    public ConversationSummaryDTO(Long id, String title, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.updatedAt = updatedAt;
        this.unreadCount = 0L;
    }

    public ConversationSummaryDTO(Long id, String title, LocalDateTime updatedAt, Long unreadCount) {
        this.id = id;
        this.title = title;
        this.updatedAt = updatedAt;
        this.unreadCount = unreadCount;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(Long unreadCount) { this.unreadCount = unreadCount; }
}
