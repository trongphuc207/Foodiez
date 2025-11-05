package com.example.demo.dto;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class ProfileUpdateRequest {
    @Size(min = 2, max = 100, message = "Full name must be 2-100 characters")
    private String fullName;
    
    @Size(min = 10, message = "Phone must be at least 10 characters")
    private String phone;
    
    @Size(min = 10, message = "Address must be at least 10 characters")
    private String address;
    
    private LocalDate dateOfBirth;
    
    private String gender;
    
    @Size(max = 20, message = "ID number must not exceed 20 characters")
    private String idNumber;
    
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
    
    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }
    
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
    
    public String getGender() {
        return gender;
    }
    
    public void setGender(String gender) {
        this.gender = gender;
    }
    
    public String getIdNumber() {
        return idNumber;
    }
    
    public void setIdNumber(String idNumber) {
        this.idNumber = idNumber;
    }
}
