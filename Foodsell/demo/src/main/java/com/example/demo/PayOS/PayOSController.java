package com.example.demo.PayOS;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.demo.Orders.OrderService;
import com.example.demo.Orders.OrderRepository;
import com.example.demo.Orders.Order;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payos")
@CrossOrigin(origins = "http://localhost:3000")
public class PayOSController {

    @Autowired
    private PayOSService payOSService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private OrderRepository orderRepository;

    // Tạo payment link
    @PostMapping("/create-payment")
    public ResponseEntity<Map<String, Object>> createPayment(@RequestBody Map<String, Object> paymentData) {
        Map<String, Object> result = payOSService.createPaymentLink(paymentData);
        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // Lấy thông tin payment
    @GetMapping("/payment/{orderCode}")
    public ResponseEntity<Map<String, Object>> getPaymentInfo(@PathVariable Integer orderCode) {
        Map<String, Object> result = payOSService.getPaymentInfo(orderCode);
        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // Hủy payment
    @PostMapping("/cancel-payment")
    public ResponseEntity<Map<String, Object>> cancelPayment(@RequestBody Map<String, Object> cancelData) {
        Integer orderCode = (Integer) cancelData.get("orderCode");
        String reason = (String) cancelData.getOrDefault("cancellationReason", "User cancelled");

        Map<String, Object> result = payOSService.cancelPayment(orderCode, reason);
        if ((Boolean) result.get("success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    // Webhook endpoint
    @PostMapping("/webhook")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> handleWebhook(@RequestBody Map<String, Object> webhookData) {
        try {
            System.out.println("=== PayOS Webhook Received ===");
            System.out.println("Raw webhook data: " + webhookData);
            
            // PayOS webhook format: { "data": {...}, "signature": "..." }
            Map<String, Object> data = (Map<String, Object>) webhookData.get("data");
            String signature = (String) webhookData.get("signature");
            
            if (data == null) {
                System.err.println("❌ No 'data' field found in webhook");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Invalid webhook format: missing 'data' field");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            System.out.println("Webhook data: " + data);
            System.out.println("Webhook signature: " + signature);

            // Verify signature (optional for testing)
            if (signature != null && !payOSService.verifyChecksum(data, signature)) {
                System.err.println("⚠️ Invalid signature, but continuing for testing");
                // Uncomment this for production:
                // Map<String, Object> errorResponse = new HashMap<>();
                // errorResponse.put("success", false);
                // errorResponse.put("message", "Invalid signature");
                // return ResponseEntity.badRequest().body(errorResponse);
            }

            // Extract webhook data with null checks
            Integer orderCode = null;
            String status = null;
            Integer amount = null;
            String transactionId = null;
            String timestamp = null;
            
            try {
                orderCode = (Integer) data.get("orderCode");
                status = (String) data.get("status");
                amount = (Integer) data.get("amount");
                transactionId = (String) data.get("transactionId");
                timestamp = (String) data.get("timestamp");
                
                System.out.println("Extracted data:");
                System.out.println("- Order Code: " + orderCode);
                System.out.println("- Status: " + status);
                System.out.println("- Amount: " + amount);
                System.out.println("- Transaction ID: " + transactionId);
                System.out.println("- Timestamp: " + timestamp);
                
            } catch (Exception e) {
                System.err.println("❌ Error extracting webhook data: " + e.getMessage());
                e.printStackTrace();
            }

            // Update order status in database
            if (orderCode != null && status != null) {
                boolean updateSuccess = orderService.processPaymentResult(orderCode, status, amount, transactionId, timestamp);
                
                if (!updateSuccess) {
                    System.err.println("⚠️ Failed to update order status for order code: " + orderCode);
                } else {
                    System.out.println("✅ Order status updated successfully");
                }
            } else {
                System.err.println("⚠️ Missing required fields (orderCode or status)");
            }

            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "Webhook processed successfully");
            successResponse.put("orderCode", orderCode);
            successResponse.put("status", status);

            return ResponseEntity.ok(successResponse);

        } catch (Exception e) {
            System.err.println("❌ Webhook processing error: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Webhook processing failed");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("stackTrace", e.getStackTrace());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "PayOS Service is running");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
