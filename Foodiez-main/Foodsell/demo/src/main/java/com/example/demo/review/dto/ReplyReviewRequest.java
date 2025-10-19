package com.example.demo.review.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ReplyReviewRequest {
    @NotBlank(message = "Nội dung phản hồi không được để trống")
    @Size(max = 1000, message = "Nội dung phản hồi không được quá 1000 ký tự")
    private String content;

    // Constructors
    public ReplyReviewRequest() {}

    public ReplyReviewRequest(String content) {
        this.content = content;
    }

    // Getters and Setters
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
