package com.example.demo.Orders;

import com.example.demo.dto.OrderDTO;
import com.example.demo.dto.OrderItemDTO;
import com.example.demo.products.ProductService;
import com.example.demo.products.ProductBasicDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class OrderService {

    @Transactional
    public OrderDTO updateOrderInfo(Integer orderId, Map<String, Object> request) {
        System.out.println("updateOrderInfo - request: " + request); // Debug log
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Cập nhật các trường cho phép
        if (request.containsKey("recipientName")) {
            order.setRecipientName((String) request.get("recipientName"));
        }
        if (request.containsKey("recipientPhone")) {
            order.setRecipientPhone((String) request.get("recipientPhone"));
        }
        if (request.containsKey("addressText")) {
            order.setAddressText((String) request.get("addressText"));
        }
        // Allow updating assignment status (seller/admin can edit)
        if (request.containsKey("assignmentStatus")) {
            try {
                String newAssignStatus = (String) request.get("assignmentStatus");
                System.out.println("Updating assignmentStatus - current: " + order.getAssignmentStatus() + ", new: " + newAssignStatus);
                order.setAssignmentStatus(newAssignStatus);
                if ("assigned".equalsIgnoreCase(newAssignStatus)) {
                    order.setAssignedAt(LocalDateTime.now());
                }
                if ("accepted".equalsIgnoreCase(newAssignStatus)) {
                    order.setAcceptedAt(LocalDateTime.now());
                }
                System.out.println("Assignment status update complete - current value: " + order.getAssignmentStatus());
            } catch (Exception ex) {
                System.out.println("Warning: invalid assignmentStatus provided: " + ex.getMessage());
                ex.printStackTrace(); // Print full stack trace for debugging
            }
        }
        // Có thể bổ sung các trường khác nếu cần

        order.setUpdatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);
        savedOrder.setOrderItems(orderItemRepository.findByOrderId(savedOrder.getId()));
        return convertToOrderDTO(savedOrder);
    }
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final ProductService productService;
    private final OrderAssignmentService orderAssignmentService;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository, OrderHistoryRepository orderHistoryRepository, ProductService productService, OrderAssignmentService orderAssignmentService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderHistoryRepository = orderHistoryRepository;
        this.productService = productService;
        this.orderAssignmentService = orderAssignmentService;
    }

    public List<OrderDTO> getAllOrders() {
        // Use custom query to fetch orders with order items
        List<Order> orders = orderRepository.findAll();
        // Manually fetch order items for each order to avoid lazy loading issues
        for (Order order : orders) {
            order.setOrderItems(orderItemRepository.findByOrderId(order.getId()));
        }
        return orders.stream()
                .map(this::convertToOrderDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO getOrderById(Integer id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null) {
            order.setOrderItems(orderItemRepository.findByOrderId(order.getId()));
            return convertToOrderDTO(order);
        }
        return null;
    }

    @Transactional
    public OrderDTO updateOrderStatus(Integer orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!isValidStatusTransition(order.getStatus(), newStatus)) {
            throw new IllegalStateException("Invalid status transition from " + order.getStatus() + " to " + newStatus);
        }

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        // Save order history
        OrderHistory history = new OrderHistory(
            orderId,
            order.getStatus(),  // statusFrom
            newStatus,         // statusTo
            "status_updated",  // action
            "Order status updated from " + order.getStatus() + " to " + newStatus,
            "system"          // createdBy
        );
        orderHistoryRepository.save(history);

        Order savedOrder = orderRepository.save(order);
        savedOrder.setOrderItems(orderItemRepository.findByOrderId(savedOrder.getId()));
        return convertToOrderDTO(savedOrder);
    }

    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        // Add your status transition validation logic here
        // Example: pending -> confirmed -> preparing -> ready -> delivering -> completed
        return true; // Temporary implementation, add your logic
    }
    
    public List<OrderDTO> getOrdersByBuyerId(Integer buyerId) {
        List<Order> orders = orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
        // Load order items for each order
        for (Order order : orders) {
            order.setOrderItems(orderItemRepository.findByOrderId(order.getId()));
        }
        return orders.stream()
                .map(this::convertToOrderDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public boolean acceptOrder(Integer orderId, Integer userId) {
        // Delegate to OrderAssignmentService
        return orderAssignmentService.acceptOrder(orderId, userId);
    }

    public List<OrderDTO> getOrdersByShopId(Integer shopId) {
        List<Order> orders = orderRepository.findByShopIdOrderByCreatedAtDesc(shopId);
        // Load order items for each order
        for (Order order : orders) {
            order.setOrderItems(orderItemRepository.findByOrderId(order.getId()));
        }
        return orders.stream()
                .map(this::convertToOrderDTO)
                .collect(Collectors.toList());
    }
    
    public long getOrderCount() {
        return orderRepository.count();
    }
    
    // Create new order with PayOS integration
    @Transactional
    public Map<String, Object> createOrder(Integer buyerId, Map<String, Object> deliveryInfo, Map<String, Object> paymentInfo, 
                                          List<Map<String, Object>> cartItems, Integer payosOrderCode, 
                                          Integer totalAmount, String status) {
        try {
            // Validate inputs
            if (totalAmount == null || totalAmount <= 0) {
                throw new IllegalArgumentException("Total amount must be greater than 0");
            }
            if (cartItems == null || cartItems.isEmpty()) {
                throw new IllegalArgumentException("Cart items cannot be empty");
            }
            
            System.out.println("Creating order with PayOS order code: " + payosOrderCode);
            
            // Create new order
            Order order = new Order();
            order.setBuyerId(buyerId); // Use the actual buyer ID from authentication

            // Determine shopId from cart items (assume single-shop order).
            // If unable to determine, fallback to 1 (legacy/default) but log a warning.
            Integer determinedShopId = null;
            if (cartItems != null && !cartItems.isEmpty()) {
                for (Map<String, Object> item : cartItems) {
                    try {
                        Integer productId = (Integer) item.get("productId");
                        if (productId == null) continue;
                        var basic = productService.getProductBasicInfo(productId);
                        if (basic != null && basic.getShopId() != null) {
                            if (determinedShopId == null) {
                                determinedShopId = basic.getShopId();
                            } else if (!determinedShopId.equals(basic.getShopId())) {
                                System.out.println("⚠️ Warning: Order contains items from multiple shops. Using first shopId: " + determinedShopId);
                                // If multi-shop orders are not supported, you could throw here instead.
                                break;
                            }
                        }
                    } catch (Exception ex) {
                        System.out.println("Warning: could not determine product info for shopId resolution: " + ex.getMessage());
                    }
                }
            }

            if (determinedShopId != null) {
                order.setShopId(determinedShopId);
            } else {
                System.out.println("⚠️ Could not determine shopId from cart items - falling back to default shopId=1");
                order.setShopId(1); // Fallback
            }

            order.setDeliveryAddressId(1); // Default address ID
            order.setTotalAmount(new BigDecimal(totalAmount));
            order.setStatus(status);
            
            // Set delivery information
            if (deliveryInfo != null) {
                System.out.println("🔍 DEBUG: deliveryInfo received: " + deliveryInfo);
                String recipientName = (String) deliveryInfo.get("recipientName");
                String recipientPhone = (String) deliveryInfo.get("recipientPhone");
                String addressText = (String) deliveryInfo.get("addressText");
                System.out.println("🔍 DEBUG: recipientName: " + recipientName);
                System.out.println("🔍 DEBUG: recipientPhone: " + recipientPhone);
                System.out.println("🔍 DEBUG: addressText: " + addressText);
                
                order.setRecipientName(recipientName);
                order.setRecipientPhone(recipientPhone);
                order.setAddressText(addressText);
            } else {
                System.out.println("🔍 DEBUG: deliveryInfo is NULL!");
            }
            
            // Set PayOS order code
            order.setOrderCode(payosOrderCode);
            
            // Set PayOS order code in notes
            String notes = "PayOS:" + payosOrderCode;
            if (paymentInfo != null) {
                notes += " | Payment Method: " + paymentInfo.get("method");
            }
            order.setNotes(notes);
            
            order.setCreatedAt(LocalDateTime.now());
            
            // Save order
            Order savedOrder = orderRepository.save(order);
            System.out.println("✅ Order created with ID: " + savedOrder.getId());
            
            // Tạo order history cho việc tạo đơn hàng
            createOrderHistory(savedOrder.getId(), null, status, "order_created", 
                "Order was created with PayOS order code: " + payosOrderCode, "system");
            
            // Create order items
            if (cartItems != null && !cartItems.isEmpty()) {
                for (Map<String, Object> item : cartItems) {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrderId(savedOrder.getId());
                    
                    // Safe casting with null checks
                    Integer productId = (Integer) item.get("productId");
                    Integer quantity = (Integer) item.get("quantity");
                    Object priceObj = item.get("price");
                    
                    if (productId == null || quantity == null || priceObj == null) {
                        System.err.println("❌ Missing required fields in cart item: " + item);
                        continue;
                    }
                    
                    // Convert price to BigDecimal safely
                    BigDecimal unitPrice;
                    try {
                        if (priceObj instanceof Integer) {
                            unitPrice = new BigDecimal((Integer) priceObj);
                        } else if (priceObj instanceof Double) {
                            unitPrice = new BigDecimal((Double) priceObj);
                        } else if (priceObj instanceof String) {
                            unitPrice = new BigDecimal((String) priceObj);
                        } else {
                            System.err.println("❌ Invalid price type: " + priceObj.getClass());
                            continue;
                        }
                        
                        // Validate unit price
                        if (unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
                            throw new IllegalArgumentException("Unit price must be greater than 0");
                        }
                        if (unitPrice.precision() > 19) {
                            throw new IllegalArgumentException("Unit price has too many digits");
                        }
                    } catch (NumberFormatException e) {
                        System.err.println("❌ Invalid price format: " + priceObj);
                        continue;
                    }
                    
                    orderItem.setProductId(productId);
                    orderItem.setQuantity(quantity);
                    orderItem.setUnitPrice(unitPrice);
                    
                    orderItemRepository.save(orderItem);
                    System.out.println("✅ Created order item: Product " + productId + ", Qty " + quantity + ", Price " + unitPrice);
                }
                System.out.println("✅ Created " + cartItems.size() + " order items");
            }
            
            // Tự động phân phối đơn hàng cho seller và shipper
            System.out.println("🔄 Auto-assigning order " + savedOrder.getId() + " to seller and shipper...");
            orderAssignmentService.autoAssignNewOrder(savedOrder.getId());
            
            // Return success response
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Order created successfully");
            result.put("orderId", savedOrder.getId());
            result.put("payosOrderCode", payosOrderCode);
            result.put("status", status);
            
            return result;
            
        } catch (Exception e) {
            System.err.println("❌ Error creating order: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "Error creating order: " + e.getMessage());
            return errorResult;
        }
    }
    
    @Transactional
    public void createTestData() {
        // Check if test data already exists
        if (orderRepository.count() > 0) {
            System.out.println("Test data already exists, skipping creation.");
            return;
        }
        
        // Create test orders
        Order order1 = new Order();
        order1.setBuyerId(1);
        order1.setShopId(1);
        order1.setDeliveryAddressId(1);
        order1.setTotalAmount(new BigDecimal("150000"));
        order1.setStatus("pending");
        order1.setNotes("Giao hàng nhanh");
        order1.setRecipientName("Nguyễn Văn A");
        order1.setRecipientPhone("0123456789");
        order1.setAddressText("123 Đường ABC, Quận 1, TP.HCM");
        order1.setCreatedAt(LocalDateTime.now());
        
        Order savedOrder1 = orderRepository.save(order1);
        
        // Create order items for order1
        OrderItem item1 = new OrderItem();
        item1.setOrderId(savedOrder1.getId());
        item1.setProductId(1);
        item1.setQuantity(2);
        item1.setUnitPrice(new BigDecimal("50000"));
        
        OrderItem item2 = new OrderItem();
        item2.setOrderId(savedOrder1.getId());
        item2.setProductId(2);
        item2.setQuantity(1);
        item2.setUnitPrice(new BigDecimal("50000"));
        
        // Save order items
        orderItemRepository.save(item1);
        orderItemRepository.save(item2);
        
        // Create second test order
        Order order2 = new Order();
        order2.setBuyerId(2);
        order2.setShopId(2);
        order2.setDeliveryAddressId(2);
        order2.setTotalAmount(new BigDecimal("200000"));
        order2.setStatus("completed");
        order2.setNotes("Đã giao hàng");
        order2.setRecipientName("Trần Thị B");
        order2.setRecipientPhone("0987654321");
        order2.setAddressText("456 Đường XYZ, Quận 2, TP.HCM");
        order2.setCreatedAt(LocalDateTime.now().minusDays(1));
        
        Order savedOrder2 = orderRepository.save(order2);
        
        // Create order items for order2
        OrderItem item3 = new OrderItem();
        item3.setOrderId(savedOrder2.getId());
        item3.setProductId(3);
        item3.setQuantity(3);
        item3.setUnitPrice(new BigDecimal("40000"));
        
        OrderItem item4 = new OrderItem();
        item4.setOrderId(savedOrder2.getId());
        item4.setProductId(4);
        item4.setQuantity(2);
        item4.setUnitPrice(new BigDecimal("40000"));
        
        // Save order items
        orderItemRepository.save(item3);
        orderItemRepository.save(item4);
        
        System.out.println("✅ Test data created successfully!");
        System.out.println("📊 Created " + orderRepository.count() + " orders");
    }
    
    // Convert Order entity to OrderDTO
    private OrderDTO convertToOrderDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setBuyerId(order.getBuyerId());
        dto.setShopId(order.getShopId());
        dto.setDeliveryAddressId(order.getDeliveryAddressId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setVoucherId(order.getVoucherId());
        dto.setNotes(order.getNotes());
        dto.setRecipientName(order.getRecipientName());
        dto.setRecipientPhone(order.getRecipientPhone());
        dto.setAddressText(order.getAddressText());
        dto.setLatitude(order.getLatitude());
        dto.setLongitude(order.getLongitude());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setAssignmentStatus(order.getAssignmentStatus());
        // Convert order items
        if (order.getOrderItems() != null) {
            List<OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                    .map(this::convertToOrderItemDTO)
                    .collect(Collectors.toList());
            dto.setOrderItems(itemDTOs);
        }
        return dto;
    }
    
    // Convert OrderItem entity to OrderItemDTO efficiently using cached basic info
    private OrderItemDTO convertToOrderItemDTO(OrderItem orderItem) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(orderItem.getId());
        dto.setOrderId(orderItem.getOrderId());
        dto.setProductId(orderItem.getProductId());
        dto.setQuantity(orderItem.getQuantity());
        dto.setUnitPrice(orderItem.getUnitPrice());
        dto.setTotalPrice(orderItem.getTotalPrice());
        
        // Use cached basic product info to avoid full product loading
        try {
            ProductBasicDTO basicInfo = productService.getProductBasicInfo(orderItem.getProductId());
            if (basicInfo != null) {
                dto.setProductName(basicInfo.getName());
                dto.setProductImage(basicInfo.getImageUrl());
            } else {
                dto.setProductName("Sản phẩm #" + orderItem.getProductId());
            }
        } catch (Exception e) {
            dto.setProductName("Sản phẩm #" + orderItem.getProductId());
            System.out.println("Warning: Could not load product basic info for ID " + orderItem.getProductId() + ": " + e.getMessage());
        }
        
        return dto;
    }
    
    // Process payment result from PayOS webhook
    @Transactional
    public boolean processPaymentResult(Integer orderCode, String status, Integer amount, String transactionId, String timestamp) {
        try {
            System.out.println("Processing payment result:");
            System.out.println("- Order Code: " + orderCode);
            System.out.println("- Status: " + status);
            System.out.println("- Amount: " + amount);
            System.out.println("- Transaction ID: " + transactionId);
            System.out.println("- Timestamp: " + timestamp);
            
            // Find order by orderCode (assuming orderCode is stored in notes or as a separate field)
            // For now, we'll use a simple approach - you might need to add a payosOrderCode field to Order entity
            List<Order> orders = orderRepository.findAll();
            Optional<Order> orderOpt = orders.stream()
                .filter(order -> order.getNotes() != null && order.getNotes().contains("PayOS:" + orderCode))
                .findFirst();
            
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                String oldStatus = order.getStatus();
                
                // Update order status based on payment status
                if ("PAID".equals(status)) {
                    // Cập nhật từ pending_payment thành paid
                    if ("pending_payment".equals(order.getStatus())) {
                        order.setStatus("confirmed");
                        System.out.println("✅ Order " + order.getId() + " updated from pending_payment to PAID");
                        
                        // Tạo order history
                        createOrderHistory(order.getId(), oldStatus, "confirmed", "payment_success", 
                            "Payment completed successfully via PayOS. Transaction ID: " + transactionId, "system");
                    } else {
                        order.setStatus("confirmed");
                        System.out.println("✅ Order " + order.getId() + " marked as PAID");
                        
                        // Tạo order history
                        createOrderHistory(order.getId(), oldStatus, "confirmed", "payment_success", 
                            "Payment completed successfully via PayOS. Transaction ID: " + transactionId, "system");
                    }
                } else if ("CANCELLED".equals(status)) {
                    order.setStatus("cancelled");
                    System.out.println("❌ Order " + order.getId() + " marked as CANCELLED");
                    
                    // Tạo order history
                    createOrderHistory(order.getId(), oldStatus, "cancelled", "payment_cancelled", 
                        "Payment was cancelled. Transaction ID: " + transactionId, "system");
                } else if ("EXPIRED".equals(status)) {
                    order.setStatus("expired");
                    System.out.println("⏰ Order " + order.getId() + " marked as EXPIRED");
                    
                    // Tạo order history
                    createOrderHistory(order.getId(), oldStatus, "expired", "payment_expired", 
                        "Payment link expired. Transaction ID: " + transactionId, "system");
                }
                
                // Update notes with payment information
                String updatedNotes = order.getNotes() + 
                    " | Payment: " + status + 
                    " | Transaction: " + transactionId + 
                    " | Time: " + timestamp;
                order.setNotes(updatedNotes);
                
                orderRepository.save(order);
                return true;
            } else {
                System.out.println("⚠️ Order not found for PayOS order code: " + orderCode);
                return false;
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error processing payment result: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    // Tạo order history
    @Transactional
    public void createOrderHistory(Integer orderId, String statusFrom, String statusTo, 
                                 String action, String description, String createdBy) {
        try {
            OrderHistory history = new OrderHistory(orderId, statusFrom, statusTo, action, description, createdBy);
            orderHistoryRepository.save(history);
            System.out.println("📝 Order history created: Order " + orderId + " " + statusFrom + " → " + statusTo);
        } catch (Exception e) {
            System.err.println("❌ Error creating order history: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // Lấy lịch sử đơn hàng
    public List<OrderHistory> getOrderHistory(Integer orderId) {
        return orderHistoryRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
    }
    
    @Transactional
    // Cập nhật trạng thái đơn hàng theo PayOS orderCode
    public boolean updateStatusByPayosOrderCode(Integer orderCode, String status) {
        try {
            
            // Tìm đơn hàng theo orderCode
            Optional<Order> orderOpt = orderRepository.findByOrderCode(orderCode);
            if (orderOpt.isEmpty()) {
                return false;
            }
            
            Order order = orderOpt.get();
            String oldStatus = order.getStatus();
            
            // Cập nhật trạng thái
            order.setStatus(status);
            orderRepository.save(order);
            
            // Tạo lịch sử
            createOrderHistory(order.getId(), oldStatus, status, "PAYMENT_UPDATE", 
                "Order status updated from payment callback", "SYSTEM");
            
            return true;
            
        } catch (Exception e) {
            System.err.println("❌ Error updating order status: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
}