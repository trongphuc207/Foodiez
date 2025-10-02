package com.example.demo.config;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", "Endpoint not found");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
}
