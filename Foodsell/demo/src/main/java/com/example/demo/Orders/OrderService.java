package com.example.demo.Orders;

import com.example.demo.dto.OrderDTO;
import com.example.demo.dto.OrderItemDTO;
import com.example.demo.products.ProductService;
import com.example.demo.products.ProductBasicDTO;
import com.example.demo.notifications.NotificationService;
import com.example.demo.notifications.Notification;
import com.example.demo.shops.ShopRepository;
import com.example.demo.shops.Shop;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Cập nhật các trường cho phép
        boolean deliveryInfoChanged = false;
        if (request.containsKey("recipientName")) {
            order.setRecipientName((String) request.get("recipientName"));
            deliveryInfoChanged = true;
        }
        if (request.containsKey("recipientPhone")) {
            order.setRecipientPhone((String) request.get("recipientPhone"));
            deliveryInfoChanged = true;
        }
        if (request.containsKey("addressText")) {
            order.setAddressText((String) request.get("addressText"));
            deliveryInfoChanged = true;
        }
        // Allow updating assignment status (seller/admin can edit)
        if (request.containsKey("assignmentStatus")) {
                try {
                String newAssignStatus = (String) request.get("assignmentStatus");
                order.setAssignmentStatus(newAssignStatus);
                if ("assigned".equalsIgnoreCase(newAssignStatus)) {
                    order.setAssignedAt(LocalDateTime.now());
                }
                if ("accepted".equalsIgnoreCase(newAssignStatus)) {
                    order.setAcceptedAt(LocalDateTime.now());
                }
                
            } catch (Exception ex) {
                // invalid assignment status provided; ignore or handle as needed
            }
        }
        // Có thể bổ sung các trường khác nếu cần

        order.setUpdatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);
        savedOrder.setOrderItems(orderItemRepository.findByOrderId(savedOrder.getId()));
        
        // ID 73: Gửi notification cho shipper khi có cập nhật delivery info
        // Sử dụng transaction riêng để không ảnh hưởng transaction chính
        if (deliveryInfoChanged && savedOrder.getAssignedShipperId() != null) {
            try {
                String updateMessage = "Địa chỉ giao hàng hoặc thông tin người nhận đã được cập nhật";
                notificationService.createNotificationInNewTransaction(
                    savedOrder.getAssignedShipperId(),
                    "DELIVERY",
                    "Cập nhật giao hàng",
                    "Đơn #" + savedOrder.getId() + ": " + updateMessage
                );
            } catch (Exception e) {
                System.err.println("Failed to send delivery update notification: " + e.getMessage());
                // Không throw exception để không ảnh hưởng transaction chính
            }
        }
        
        return convertToOrderDTO(savedOrder);
    }
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final ProductService productService;
    private final OrderAssignmentService orderAssignmentService;
    private final NotificationService notificationService;
    private final ShopRepository shopRepository;
    
    @PersistenceContext
    private EntityManager entityManager;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository, OrderHistoryRepository orderHistoryRepository, ProductService productService, OrderAssignmentService orderAssignmentService, NotificationService notificationService, ShopRepository shopRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderHistoryRepository = orderHistoryRepository;
        this.productService = productService;
        this.orderAssignmentService = orderAssignmentService;
        this.notificationService = notificationService;
        this.shopRepository = shopRepository;
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

        String oldStatus = order.getStatus();
        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        // Save order history
        OrderHistory history = new OrderHistory(
            orderId,
            oldStatus,         // statusFrom
            newStatus,         // statusTo
            "status_updated",  // action
            "Order status updated from " + oldStatus + " to " + newStatus,
            "system"          // createdBy
        );
        orderHistoryRepository.save(history);

        Order savedOrder = orderRepository.save(order);
        savedOrder.setOrderItems(orderItemRepository.findByOrderId(savedOrder.getId()));
        
        // ID 71: Gửi notification cho customer khi cập nhật trạng thái đơn hàng
        // Sử dụng transaction riêng để không ảnh hưởng transaction chính
        try {
            String statusMessage = getStatusMessage(newStatus);
            notificationService.createNotificationInNewTransaction(
                savedOrder.getBuyerId(),
                "ORDER",
                "Cập nhật trạng thái đơn hàng",
                "Đơn hàng #" + savedOrder.getId() + " đã chuyển sang trạng thái: " + statusMessage
            );
        } catch (Exception e) {
            // Log error but don't fail status update
            System.err.println("Failed to send order status notification: " + e.getMessage());
            // Không throw exception để không ảnh hưởng transaction chính
        }
        
        // ID 68: Gửi notification cho merchant khi đơn bị hủy
        // Sử dụng transaction riêng để không ảnh hưởng transaction chính
        if ("cancelled".equalsIgnoreCase(newStatus) || "CANCELLED".equalsIgnoreCase(newStatus)) {
            try {
                Optional<Shop> shopOpt = shopRepository.findById(savedOrder.getShopId());
                if (shopOpt.isPresent()) {
                    Integer merchantId = shopOpt.get().getSellerId();
                    notificationService.createNotificationInNewTransaction(
                        merchantId,
                        "ORDER",
                        "Đơn hàng bị hủy",
                        "Đơn hàng #" + savedOrder.getId() + " đã bị hủy"
                    );
                }
            } catch (Exception e) {
                System.err.println("Failed to send cancellation notification to merchant: " + e.getMessage());
                // Không throw exception để không ảnh hưởng transaction chính
            }
            
            // Gửi notification cho shipper khi order bị hủy
            if (savedOrder.getAssignedShipperId() != null) {
                try {
                    notificationService.createNotificationInNewTransaction(
                        savedOrder.getAssignedShipperId(),
                        "DELIVERY",
                        "Đơn giao hàng bị hủy",
                        "Đơn #" + savedOrder.getId() + " đã bị hủy"
                    );
                } catch (Exception e) {
                    System.err.println("Failed to send cancellation notification to shipper: " + e.getMessage());
                }
            }
        }
        
        // Gửi notification cho shipper khi order status thay đổi sang delivering hoặc completed
        if (("delivering".equalsIgnoreCase(newStatus) || "completed".equalsIgnoreCase(newStatus)) 
            && savedOrder.getAssignedShipperId() != null) {
            try {
                String statusMessage = getStatusMessage(newStatus);
                notificationService.createNotificationInNewTransaction(
                    savedOrder.getAssignedShipperId(),
                    "DELIVERY",
                    "Cập nhật trạng thái giao hàng",
                    "Đơn #" + savedOrder.getId() + " đã chuyển sang trạng thái: " + statusMessage
                );
            } catch (Exception e) {
                System.err.println("Failed to send delivery status notification to shipper: " + e.getMessage());
            }
        }
        
        // Gửi notification cho customer khi order được giao (delivering -> completed)
        if ("completed".equalsIgnoreCase(newStatus) && "delivering".equalsIgnoreCase(oldStatus)) {
            try {
                notificationService.createNotificationInNewTransaction(
                    savedOrder.getBuyerId(),
                    "ORDER",
                    "Đơn hàng đã được giao",
                    "Đơn hàng #" + savedOrder.getId() + " đã được giao thành công. Cảm ơn bạn đã sử dụng dịch vụ!"
                );
            } catch (Exception e) {
                System.err.println("Failed to send delivery completion notification to customer: " + e.getMessage());
            }
        }
        
        return convertToOrderDTO(savedOrder);
    }

    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        // Add your status transition validation logic here
        // Example: pending -> confirmed -> preparing -> ready -> delivering -> completed
        return true; // Temporary implementation, add your logic
    }
    
    // Helper method để chuyển đổi status code sang message dễ hiểu
    private String getStatusMessage(String status) {
        if (status == null) return "Không xác định";
        switch (status.toLowerCase()) {
            case "pending": return "Đang chờ xử lý";
            case "pending_payment": return "Chờ thanh toán";
            case "confirmed": return "Đã xác nhận";
            case "preparing": return "Đang chuẩn bị";
            case "ready": return "Sẵn sàng";
            case "delivering": return "Đang giao hàng";
            case "completed": return "Hoàn thành";
            case "cancelled": return "Đã hủy";
            case "expired": return "Hết hạn";
            default: return status;
        }
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
    @Transactional(timeout = 30) // Thêm timeout 30 giây để tránh treo
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
                                // Order contains items from multiple shops; using first determined shopId
                                // If multi-shop orders are not supported, you could throw here instead.
                                break;
                            }
                        }
                    } catch (Exception ex) {
                        // ignore product info resolution errors
                    }
                }
            }

            if (determinedShopId != null) {
                order.setShopId(determinedShopId);
            } else {
                order.setShopId(1); // Fallback
            }

            order.setDeliveryAddressId(1); // Default address ID
            order.setTotalAmount(new BigDecimal(totalAmount));
            order.setStatus(status);
            
            // Set delivery information
            if (deliveryInfo != null) {
                
                String recipientName = (String) deliveryInfo.get("recipientName");
                String recipientPhone = (String) deliveryInfo.get("recipientPhone");
                String addressText = (String) deliveryInfo.get("addressText");
                
                
                order.setRecipientName(recipientName);
                order.setRecipientPhone(recipientPhone);
                order.setAddressText(addressText);
            } else {
                // deliveryInfo is null; proceed with defaults
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
            System.out.println("📦 Saving order to database...");
            Order savedOrder = orderRepository.save(order);
            System.out.println("✅ Order saved: ID=" + savedOrder.getId());
            
            // Tạo order history cho việc tạo đơn hàng
            System.out.println("📝 Creating order history...");
            createOrderHistory(savedOrder.getId(), null, status, "order_created", 
                "Order was created with PayOS order code: " + payosOrderCode, "system");
            System.out.println("✅ Order history created");
            
            // Create order items
            System.out.println("📦 Creating order items...");
            if (cartItems != null && !cartItems.isEmpty()) {
                for (Map<String, Object> item : cartItems) {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrderId(savedOrder.getId());
                    
                    // Safe casting with null checks
                    Integer productId = (Integer) item.get("productId");
                    Integer quantity = (Integer) item.get("quantity");
                    Object priceObj = item.get("price");
                    
                    if (productId == null || quantity == null || priceObj == null) {
                        // Missing required fields in cart item: skip
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
                            // Invalid price object type: skip this item
                            continue;
                        }
                        
                        // Validate unit price - không throw exception, chỉ skip item không hợp lệ
                        if (unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
                            System.err.println("⚠️ Invalid unit price (<= 0) for product " + productId + ", skipping this item");
                            continue; // Skip item này thay vì throw exception
                        }
                        if (unitPrice.precision() > 19) {
                            System.err.println("⚠️ Unit price has too many digits for product " + productId + ", skipping this item");
                            continue; // Skip item này thay vì throw exception
                        }
                    } catch (NumberFormatException e) {
                        // Invalid price format: skip
                        continue;
                    }
                    
                    orderItem.setProductId(productId);
                    orderItem.setQuantity(quantity);
                    orderItem.setUnitPrice(unitPrice);
                    
                    orderItemRepository.save(orderItem);
                }
                System.out.println("✅ Order items created");
            }
            
            // Flush để đảm bảo tất cả dữ liệu được commit ngay
            System.out.println("💾 Flushing order data to database...");
            entityManager.flush();
            System.out.println("✅ Order data flushed");
            
            // TẠO NOTIFICATION TRONG CÙNG TRANSACTION - đảm bảo nó được commit cùng với order
            System.out.println("📢 ===== CREATING NOTIFICATIONS (IN SAME TRANSACTION) =====");
            final Integer finalOrderId = savedOrder.getId();
            final Integer finalBuyerId = buyerId;
            final Integer finalShopId = savedOrder.getShopId();
            
            // Gửi notification cho customer - TẠO TRỰC TIẾP trong transaction chính
            // Điều này đảm bảo notification được commit cùng với order
            try {
                System.out.println("📢 Creating customer notification for order " + finalOrderId);
                System.out.println("📢 Buyer ID: " + finalBuyerId);
                if (finalBuyerId != null) {
                    // Tạo notification TRỰC TIẾP trong transaction chính (không dùng REQUIRES_NEW)
                    // Điều này đảm bảo notification được commit cùng với order
                    // Sử dụng REQUIRES_NEW để đảm bảo không ảnh hưởng transaction chính
                    Notification customerNotif = notificationService.createNotificationInNewTransaction(
                        finalBuyerId,
                        "ORDER",
                        "Đặt hàng thành công",
                        "Đơn hàng #" + finalOrderId + " của bạn đã được đặt thành công. Vui lòng chờ xác nhận từ shop."
                    );
                    
                    if (customerNotif != null && customerNotif.getId() != null) {
                        System.out.println("✅ ✅ ✅ Customer notification created: ID=" + customerNotif.getId() + 
                            ", UserId=" + customerNotif.getUserId() + 
                            ", Type=" + customerNotif.getType() + 
                            ", Title=" + customerNotif.getTitle());
                    } else {
                        System.err.println("❌ ❌ ❌ Customer notification returned null!");
                    }
                } else {
                    System.err.println("❌ Buyer ID is null, cannot create notification");
                }
            } catch (Exception e) {
                System.err.println("❌ Failed to create customer notification: " + e.getMessage());
                e.printStackTrace();
                // KHÔNG throw exception - chỉ log để không ảnh hưởng order creation
            }
            
            // Gửi notification cho merchant
            try {
                System.out.println("📢 Creating merchant notification for order " + finalOrderId);
                Optional<Shop> shopOpt = shopRepository.findById(finalShopId);
                if (shopOpt.isPresent()) {
                    Integer merchantId = shopOpt.get().getSellerId();
                    if (merchantId != null) {
                        // Sử dụng REQUIRES_NEW để đảm bảo không ảnh hưởng transaction chính
                        Notification merchantNotif = notificationService.createNotificationInNewTransaction(
                            merchantId,
                            "ORDER",
                            "Đơn hàng mới",
                            "Bạn có đơn hàng mới #" + finalOrderId
                        );
                        if (merchantNotif != null) {
                            System.out.println("✅ Merchant notification created: ID=" + merchantNotif.getId());
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("⚠️ Failed to send order notification to merchant: " + e.getMessage());
                // KHÔNG throw exception - chỉ log
            }
            
            System.out.println("✅ ===== NOTIFICATIONS CREATED =====");
            
            // Return success response
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Order created successfully");
            result.put("orderId", savedOrder.getId());
            result.put("payosOrderCode", payosOrderCode);
            result.put("status", status);
            
            System.out.println("✅ ===== ORDER CREATION COMPLETED - RETURNING RESPONSE =====");
            
            // Chạy các operations KHÔNG QUAN TRỌNG SAU KHI return (async)
            // Chỉ auto-assignment, notification đã được tạo ở trên
            final Integer asyncOrderId = savedOrder.getId();
            new Thread(() -> {
                try {
                    System.out.println("🔄 Starting async operations for order " + asyncOrderId);
                    
                    // Tự động phân phối đơn hàng cho seller và shipper
                    try {
                        System.out.println("👥 Auto-assigning order " + asyncOrderId);
                        orderAssignmentService.autoAssignNewOrder(asyncOrderId);
                        System.out.println("✅ Auto-assignment completed");
                    } catch (Exception e) {
                        System.err.println("⚠️ Failed to auto-assign order " + asyncOrderId + ": " + e.getMessage());
                        e.printStackTrace();
                    }
                    
                    System.out.println("✅ All async operations completed for order " + asyncOrderId);
                } catch (Exception e) {
                    System.err.println("❌ Error in async operations: " + e.getMessage());
                    e.printStackTrace();
                }
            }).start();
            
            return result;
            
        } catch (Exception e) {
            // Error creating order: return failure result
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "Error creating order: " + e.getMessage());
            return errorResult;
        }
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
            // ignore product info load errors
        }
        
        return dto;
    }
    
    // Process payment result from PayOS webhook
    @Transactional
    public boolean processPaymentResult(Integer orderCode, String status, Integer amount, String transactionId, String timestamp) {
        try {
            // Process payment result: (input received)
            // Find order by orderCode (assuming orderCode is stored in notes or as a separate field)
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
                        // order updated from pending_payment to PAID
                        // Tạo order history
                        createOrderHistory(order.getId(), oldStatus, "confirmed", "payment_success", 
                            "Payment completed successfully via PayOS. Transaction ID: " + transactionId, "system");
                    } else {
                        order.setStatus("confirmed");
                        // order marked as PAID
                        
                        // Tạo order history
                        createOrderHistory(order.getId(), oldStatus, "confirmed", "payment_success", 
                            "Payment completed successfully via PayOS. Transaction ID: " + transactionId, "system");
                    }
                } else if ("CANCELLED".equals(status)) {
                    order.setStatus("cancelled");
                    
                    // Tạo order history
                    createOrderHistory(order.getId(), oldStatus, "cancelled", "payment_cancelled", 
                        "Payment was cancelled. Transaction ID: " + transactionId, "system");
                } else if ("EXPIRED".equals(status)) {
                    order.setStatus("expired");
                    
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
                
                // ID 71: Gửi notification cho customer khi payment status thay đổi
                // Sử dụng transaction riêng để không ảnh hưởng transaction chính
                try {
                    String statusMessage = getStatusMessage(order.getStatus());
                    notificationService.createNotificationInNewTransaction(
                        order.getBuyerId(),
                        "ORDER",
                        "Cập nhật trạng thái đơn hàng",
                        "Đơn hàng #" + order.getId() + " đã chuyển sang trạng thái: " + statusMessage
                    );
                } catch (Exception e) {
                    System.err.println("Failed to send payment status notification: " + e.getMessage());
                    // Không throw exception để không ảnh hưởng transaction chính
                }
                
                return true;
            } else {
                // Order not found for PayOS order code
                return false;
            }
            
        } catch (Exception e) {
            // Error processing payment result
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
        } catch (Exception e) {
            // Error creating order history: ignore or log upstream
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
            // Error updating order status
            return false;
        }
    }
    
}