package com.example.demo.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/system")
public class SystemController {

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> settings() {
        AdminAuth.requireAdmin();
        return ResponseEntity.ok(Map.of(
                "version", "1.0.0",
                "maintenanceMode", false
        ));
    }
}
