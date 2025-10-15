package com.example.demo;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
@CrossOrigin(origins = "http://localhost:3000")
public class TestController {
    
    @GetMapping("/orders")
    public String testOrders() {
        return "Orders test endpoint is working!";
    }
    
    @GetMapping("/simple")
    public String simpleTest() {
        return "Simple test endpoint is working!";
    }
}