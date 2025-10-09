package com.example.demo.admin;

import com.example.demo.Users.User;
import com.example.demo.Users.UserRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminUserService {

    private static final Set<String> ALLOWED_ROLES =
            Set.of("buyer", "seller", "admin", "shipper"); // khớp CHECK trong DB

    @Autowired
    private UserRepository userRepo;

    public List<User> getAll() {
        return userRepo.findAll();
    }

    @Transactional
    public void updateRole(int id, String role) {
        if (role == null || !ALLOWED_ROLES.contains(role.toLowerCase())) {
            throw new IllegalArgumentException("Invalid role: " + role + " (must be buyer/seller/admin/shipper)");
        }
        User u = userRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        u.setRole(role.toLowerCase());
        userRepo.save(u);
    }

    @Transactional
    public void deleteUser(int id) {
        userRepo.deleteById(id);
    }
}
