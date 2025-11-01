package com.example.demo.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class GoogleLoginRequest {
    @NotEmpty(message = "ID token is required")
    private String idToken;
}