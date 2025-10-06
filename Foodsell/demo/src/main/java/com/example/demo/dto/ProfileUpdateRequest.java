package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProfileUpdateRequest {
    @Size(min = 2, max = 100, message = "Full name must be 2-100 characters")
    private String fullName;
    
    @Size(min = 10, message = "Phone must be at least 10 characters")
    private String phone;
    
    @Size(min = 10, message = "Address must be at least 10 characters")
    private String address;
    
    // Constructor
    public ProfileUpdateRequest() {}
    
    public ProfileUpdateRequest(String fullName, String phone, String address) {
        this.fullName = fullName;
        this.phone = phone;
        this.address = address;
    }
    
    // Getters and Setters
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
}
