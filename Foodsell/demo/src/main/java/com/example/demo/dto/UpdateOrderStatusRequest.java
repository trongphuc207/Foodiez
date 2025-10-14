package com.example.demo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(pending|confirmed|preparing|shipping|delivered|cancelled)$", 
             message = "Status must be one of: pending, confirmed, preparing, shipping, delivered, cancelled")
    private String status;
}
