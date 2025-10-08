package com.example.demo;

import com.example.demo.dto.OrderDTO;
import com.example.demo.Orders.OrderService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {
    
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // GET: Lấy tất cả đơn hàng
    @GetMapping
    public List<OrderDTO> getAllOrders() {
        return orderService.getAllOrders();
    }
    
    // GET: Lấy đơn hàng theo ID
    @GetMapping("/{id}")
    public OrderDTO getOrderById(@PathVariable Integer id) {
        return orderService.getOrderById(id);
    }
    
    // GET: Test endpoint
    @GetMapping("/test")
    public String test() {
        return "Orders API is working!";
    }
    
    // POST: Create test order data
    @PostMapping("/create-test-data")
    public String createTestData() {
        try {
            orderService.createTestData();
            return "Test data created successfully!";
        } catch (Exception e) {
            return "Error creating test data: " + e.getMessage();
        }
    }
    
    // GET: Lấy đơn hàng theo buyer ID
    @GetMapping("/buyer/{buyerId}")
    public List<OrderDTO> getOrdersByBuyerId(@PathVariable Integer buyerId) {
        return orderService.getOrdersByBuyerId(buyerId);
    }
    
    // GET: Lấy đơn hàng theo shop ID
    @GetMapping("/shop/{shopId}")
    public List<OrderDTO> getOrdersByShopId(@PathVariable Integer shopId) {
        return orderService.getOrdersByShopId(shopId);
    }
}