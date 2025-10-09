package com.example.demo.admin;

import com.example.demo.Users.User;
import com.example.demo.Users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired private UserRepository userRepo;

    @GetMapping
    public List<User> list() {
        AdminAuth.requireAdmin();
        return userRepo.findAll();
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<String> updateRole(@PathVariable int id, @RequestParam String role) {
        AdminAuth.requireAdmin();
        User u = userRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
        u.setRole(role); // hợp lệ với CHECK trong DB
        userRepo.save(u);
        return ResponseEntity.ok("Role updated");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable int id) {
        AdminAuth.requireAdmin();
        userRepo.deleteById(id);
        return ResponseEntity.ok("User deleted");
    }
}
