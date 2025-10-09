package com.example.demo.admin;

import com.example.demo.Users.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

final class AdminAuth {
    private AdminAuth() {}
    static void requireAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User u) || !"admin".equalsIgnoreCase(u.getRole())) {
            throw new RuntimeException("Access denied: admin only");
        }
    }
}
