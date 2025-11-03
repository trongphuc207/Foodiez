package com.example.demo.chat.dto;

import java.time.LocalDateTime;

public class ChatMessageResponse {
    private Long id;
    private Long conversationId;
    private Integer senderId;
    private String content;
    private LocalDateTime createdAt;

    public ChatMessageResponse() {}

    public ChatMessageResponse(Long id, Long conversationId, Integer senderId, String content, LocalDateTime createdAt) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.content = content;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getConversationId() { return conversationId; }
    public Integer getSenderId() { return senderId; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
    public void setSenderId(Integer senderId) { this.senderId = senderId; }
    public void setContent(String content) { this.content = content; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

