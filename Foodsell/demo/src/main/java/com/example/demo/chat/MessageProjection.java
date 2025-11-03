package com.example.demo.chat;

import java.time.LocalDateTime;

public interface MessageProjection {
    Long getId();
    Long getConversationId();
    Integer getSenderId();
    String getContent();
    LocalDateTime getCreatedAt();
}

