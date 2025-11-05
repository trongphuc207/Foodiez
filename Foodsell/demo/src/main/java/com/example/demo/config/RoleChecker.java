package com.example.demo.config;

import com.example.demo.Users.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class RoleChecker {
    
    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return false;
        }
        
        User user = (User) authentication.getPrincipal();
        return role.equalsIgnoreCase(user.getRole());
    }
    
    public boolean hasAnyRole(String... roles) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return false;
        }
        
        User user = (User) authentication.getPrincipal();
        String userRole = user.getRole();
        
        if (userRole == null) {
            return false;
        }
        
        for (String role : roles) {
            if (role.equalsIgnoreCase(userRole)) {
                return true;
            }
        }
        return false;
    }
    
    public boolean isCustomer() {
        return hasRole("customer") || hasRole("buyer");
    }
    
    public boolean isSeller() {
        return hasRole("seller");
    }
    
    public boolean isAdmin() {
        return hasRole("admin");
    }
    
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return null;
        }
        return (User) authentication.getPrincipal();
    }
}
