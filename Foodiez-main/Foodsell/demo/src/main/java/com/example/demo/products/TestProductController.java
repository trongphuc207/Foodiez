package com.example.demo.products;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test-product")
@CrossOrigin(origins = "http://localhost:3000")
public class TestProductController {
    
    @GetMapping
    public String test() {
        return "TestProductController is working!";
    }
}

