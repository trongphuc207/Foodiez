package com.example.demo;

import com.example.demo.config.RoleChecker;
import com.example.demo.dto.*;
import com.example.demo.Orders.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin(origins = "http://localhost:3000")
public class SellerController {
    
    @Autowired
    private SellerService sellerService;
    
    @Autowired
    private RoleChecker roleChecker;

    /**
     * GET /api/seller/dashboard/{shopId}
     * Get dashboard statistics for seller
     */
    @GetMapping("/dashboard/{shopId}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SellerDashboardDTO>> getDashboard(@PathVariable Integer shopId) {
        try {
            SellerDashboardDTO stats = sellerService.getDashboardStats(shopId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Dashboard loaded successfully", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error loading dashboard: " + e.getMessage(), null));
        }
    }
    
    /**
     * GET /api/seller/orders/{shopId}?status={status}
     * Get orders for seller's shop with optional status filter
     */
    @GetMapping("/orders/{shopId}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SellerOrderDTO>>> getOrders(
            @PathVariable Integer shopId,
            @RequestParam(required = false) String status) {
        try {
            List<SellerOrderDTO> orders = sellerService.getOrders(shopId, status);
            return ResponseEntity.ok(new ApiResponse<>(true, "Orders loaded successfully", orders));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error loading orders: " + e.getMessage(), null));
        }
    }
    
    /**
     * GET /api/seller/orders/detail/{orderId}
     * Get order details by ID
     */
    @GetMapping("/orders/detail/{orderId}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SellerOrderDTO>> getOrderById(@PathVariable Integer orderId) {
        try {
            // This would need to be implemented in service
            return ResponseEntity.ok(new ApiResponse<>(true, "Order details loaded", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error loading order: " + e.getMessage(), null));
        }
    }
    
    /**
     * PUT /api/seller/orders/{orderId}/status
     * Update order status
     */
    @PutMapping("/orders/{orderId}/status")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestBody UpdateOrderStatusRequest request) {
        try {
            Order updatedOrder = sellerService.updateOrderStatus(
                orderId, 
                request.getStatus(), 
                request.getNotes()
            );
            return ResponseEntity.ok(new ApiResponse<>(true, "Order status updated successfully", updatedOrder));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error updating order status: " + e.getMessage(), null));
        }
    }
    
    /**
     * GET /api/seller/revenue/{shopId}
     * Get revenue statistics with optional date range
     */
    @GetMapping("/revenue/{shopId}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RevenueDTO>> getRevenue(
            @PathVariable Integer shopId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            // Default to last 30 days if no date range specified
            RevenueDTO revenue = sellerService.getDailyRevenue(shopId, 30);
            return ResponseEntity.ok(new ApiResponse<>(true, "Revenue loaded successfully", revenue));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error loading revenue: " + e.getMessage(), null));
        }
    }
    
    /**
     * GET /api/seller/revenue/{shopId}/daily?days={days}
     * Get daily revenue for specified number of days
     */
    @GetMapping("/revenue/{shopId}/daily")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RevenueDTO>> getDailyRevenue(
            @PathVariable Integer shopId,
            @RequestParam(defaultValue = "7") Integer days) {
        try {
            RevenueDTO revenue = sellerService.getDailyRevenue(shopId, days);
            return ResponseEntity.ok(new ApiResponse<>(true, "Daily revenue loaded successfully", revenue));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error loading daily revenue: " + e.getMessage(), null));
        }
    }
    
    /**
     * GET /api/seller/revenue/{shopId}/monthly?year={year}
     * Get monthly revenue for specified year
     */
    @GetMapping("/revenue/{shopId}/monthly")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RevenueDTO>> getMonthlyRevenue(
            @PathVariable Integer shopId,
            @RequestParam(required = false) Integer year) {
        try {
            if (year == null) {
                year = java.time.Year.now().getValue();
            }
            RevenueDTO revenue = sellerService.getMonthlyRevenue(shopId, year);
            return ResponseEntity.ok(new ApiResponse<>(true, "Monthly revenue loaded successfully", revenue));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error loading monthly revenue: " + e.getMessage(), null));
        }
    }
    
    /**
     * GET /api/seller/customers/{shopId}
     * Get all customers who purchased from this shop
     */
    @GetMapping("/customers/{shopId}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CustomerDTO>>> getCustomers(@PathVariable Integer shopId) {
        try {
            List<CustomerDTO> customers = sellerService.getCustomers(shopId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Customers loaded successfully", customers));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error loading customers: " + e.getMessage(), null));
        }
    }
    
    /**
     * GET /api/seller/customers/{shopId}/top?limit={limit}
     * Get top customers by total spending
     */
    @GetMapping("/customers/{shopId}/top")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CustomerDTO>>> getTopCustomers(
            @PathVariable Integer shopId,
            @RequestParam(defaultValue = "10") Integer limit) {
        try {
            List<CustomerDTO> topCustomers = sellerService.getTopCustomers(shopId, limit);
            return ResponseEntity.ok(new ApiResponse<>(true, "Top customers loaded successfully", topCustomers));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error loading top customers: " + e.getMessage(), null));
        }
    }
    
    /**
     * GET /api/seller/products/{shopId}/stats
     * Get product statistics
     */
    @GetMapping("/products/{shopId}/stats")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductStats(@PathVariable Integer shopId) {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("message", "Product statistics");
            return ResponseEntity.ok(new ApiResponse<>(true, "Product stats loaded", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error loading product stats: " + e.getMessage(), null));
        }
    }
    
    /**
     * GET /api/seller/products/{shopId}/best-selling?limit={limit}
     * Get best selling products
     */
    @GetMapping("/products/{shopId}/best-selling")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BestSellingProductDTO>>> getBestSellingProducts(
            @PathVariable Integer shopId,
            @RequestParam(defaultValue = "10") Integer limit) {
        try {
            List<BestSellingProductDTO> products = sellerService.getBestSellingProducts(shopId, limit);
            return ResponseEntity.ok(new ApiResponse<>(true, "Best selling products loaded successfully", products));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error loading best selling products: " + e.getMessage(), null));
        }
    }
    
    /**
     * GET /api/seller/reviews/{shopId}?type={type}
     * Get reviews for shop (type: all, product, shop)
     */
    @GetMapping("/reviews/{shopId}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReviews(
            @PathVariable Integer shopId,
            @RequestParam(defaultValue = "all") String type) {
        try {
            Map<String, Object> reviews = new HashMap<>();
            reviews.put("message", "Reviews for shop");
            reviews.put("type", type);
            return ResponseEntity.ok(new ApiResponse<>(true, "Reviews loaded", reviews));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Error loading reviews: " + e.getMessage(), null));
        }
    }
}
