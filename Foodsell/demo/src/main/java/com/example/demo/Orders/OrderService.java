package com.example.demo.Orders;

import com.example.demo.dto.OrderDTO;
import com.example.demo.dto.OrderItemDTO;
import com.example.demo.products.ProductService;
import com.example.demo.chat.Conversation;
import com.example.demo.chat.Message;
import com.example.demo.shops.ShopService;
import com.example.demo.shops.Shop;
import com.example.demo.products.ProductBasicDTO;
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
        return convertToOrderDTO(savedOrder);
    }
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final ProductService productService;
    private final ShopService shopService;
    private final OrderAssignmentService orderAssignmentService;
    private final com.example.demo.chat.ChatService chatService;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository, OrderHistoryRepository orderHistoryRepository, ProductService productService, ShopService shopService, OrderAssignmentService orderAssignmentService, com.example.demo.chat.ChatService chatService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderHistoryRepository = orderHistoryRepository;
        this.productService = productService;
        this.shopService = shopService;
        this.orderAssignmentService = orderAssignmentService;
        this.chatService = chatService;
    }

    public List<OrderDTO> getAllOrders() {
        // Use custom query to fetch orders with order items
        List<Order> orders = orderRepository.findAll();
        // Batch-load order items for the orders to avoid N+1 queries
        loadOrderItemsForOrders(orders);
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

    // Return Order entity (used by controllers for ownership checks / deletes)
    public Order getOrderEntityById(Integer id) {
        return orderRepository.findById(id).orElse(null);
    }

    @Transactional
    public boolean deleteOrderById(Integer id) {
        try {
            Order order = orderRepository.findById(id).orElse(null);
            if (order == null) return false;
            // Only allow deleting cancelled orders
            if (order.getIsCancelled() == null || !order.getIsCancelled()) return false;

            orderRepository.delete(order);

            // record history
            createOrderHistory(id, order.getStatus(), order.getStatus(), "order_deleted", "Order deleted by seller/admin", "system");
            return true;
        } catch (Exception e) {
            return false;
        }
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
        // Batch-load order items to avoid N+1 selects
        loadOrderItemsForOrders(orders);
        return orders.stream()
                .map(this::convertToOrderDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public boolean acceptOrder(Integer orderId, Integer userId) {
        // Delegate to OrderAssignmentService
        return orderAssignmentService.acceptOrder(orderId, userId);
    }

    @Transactional
    public boolean cancelWithinWindow(Integer orderId, Integer userId, String reason) {
        try {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) return false;

            // Already cancelled?
            if (order.getIsCancelled() != null && order.getIsCancelled()) return false;

            // Only allow cancel for pending orders
            if (!"pending".equalsIgnoreCase(order.getStatus())) return false;

            // Seller-wins: if assignment_status == 'accepted' do not allow automatic cancel
            String assign = order.getAssignmentStatus();
            if (assign != null && "accepted".equalsIgnoreCase(assign)) return false;

            // Enforce 3-minute window from createdAt
            LocalDateTime created = order.getCreatedAt();
            LocalDateTime now = LocalDateTime.now();
            if (created == null) return false;
            if (created.isBefore(now.minusMinutes(3))) return false;

            // Perform cancel
            order.setIsCancelled(true);
            order.setCancelledAt(now);
            order.setCancelledBy(userId);
            order.setCancelReason(reason);
            order.setUpdatedAt(now);
            orderRepository.save(order);

            // Save history
            createOrderHistory(orderId, order.getStatus(), order.getStatus(), "cancelled", "Order cancelled by buyer: " + reason, String.valueOf(userId));

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Cancel an order if it's still cancellable within buyer window, or notify merchant via chat when the order is already paid/confirmed.
     * Returns a map describing the result:
     *  - success: boolean
     *  - forwardedToChat: boolean (true when we sent a chat message instead of auto-cancelling)
     *  - code/message: optional details
     */
    @Transactional
    public Map<String, Object> cancelOrNotifyForPaid(Integer orderId, Integer userId, String reason) {
        Map<String, Object> resp = new HashMap<>();
        try {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) {
                resp.put("success", false);
                resp.put("code", "not_found");
                resp.put("message", "Order not found");
                return resp;
            }

            if (order.getIsCancelled() != null && order.getIsCancelled()) {
                resp.put("success", false);
                resp.put("code", "already_cancelled");
                resp.put("message", "Order already cancelled");
                return resp;
            }

            // Seller wins: if assignment_status == 'accepted' do not allow automatic cancel
            String assign = order.getAssignmentStatus();
            if (assign != null && "accepted".equalsIgnoreCase(assign)) {
                resp.put("success", false);
                resp.put("code", "cancel_not_allowed");
                resp.put("message", "Seller already accepted the order");
                return resp;
            }

            // Enforce 3-minute window from createdAt
            LocalDateTime created = order.getCreatedAt();
            LocalDateTime now = LocalDateTime.now();
            if (created == null) {
                resp.put("success", false);
                resp.put("code", "invalid_order");
                return resp;
            }
            if (created.isBefore(now.minusMinutes(3))) {
                resp.put("success", false);
                resp.put("code", "cancel_window_expired");
                resp.put("message", "Cancel window expired");
                return resp;
            }

            // If order is paid/confirmed we DO NOT auto-cancel or auto-create chat message anymore.
            // Instead we return an instructional response for the client to show to user.
            String status = order.getStatus() == null ? "" : order.getStatus();
            if ("confirmed".equalsIgnoreCase(status) || "paid".equalsIgnoreCase(status) || status.toLowerCase().contains("paid")) {
                String shopName = "shop";
                try {
                    var shopOpt = shopService.getShopById(order.getShopId());
                    if (shopOpt != null && shopOpt.isPresent()) {
                        Shop shopEntity = shopOpt.get();
                        if (shopEntity.getName() != null && !shopEntity.getName().isBlank()) {
                            shopName = shopEntity.getName();
                        }
                    }
                } catch (Exception ignored) {}
                String displayMessage = String.format(
                        "Đơn hàng #%d đã được thanh toán / xác nhận. Vui lòng tự nhắn tin với chủ shop (%s) trước khi đơn hàng được chấp nhận hoàn tất.",
                        orderId, shopName);
                resp.put("success", false); // cancel not executed
                resp.put("code", "manual_chat_required");
                resp.put("forwardedToChat", false);
                resp.put("message", displayMessage);
                // Optional history entry to log the attempt without performing cancellation
                createOrderHistory(orderId, order.getStatus(), order.getStatus(), "cancel_requested", "Buyer requested cancel after payment/confirmation - instructed manual chat", String.valueOf(userId));
                return resp;
            }

            // Otherwise perform the existing auto-cancel flow
            order.setIsCancelled(true);
            order.setCancelledAt(now);
            order.setCancelledBy(userId);
            order.setCancelReason(reason);
            order.setUpdatedAt(now);
            orderRepository.save(order);

            createOrderHistory(orderId, order.getStatus(), order.getStatus(), "cancelled", "Order cancelled by buyer: " + reason, String.valueOf(userId));

            resp.put("success", true);
            resp.put("forwardedToChat", false);
            return resp;
        } catch (Exception e) {
            resp.put("success", false);
            resp.put("code", "internal_error");
            resp.put("message", e.getMessage());
            return resp;
        }
    }

    /**
     * Force-cancel an order by seller. Minimal checks: order must exist and not already cancelled.
     * This is intended for seller-initiated immediate cancellation and will record an order history entry.
     */
    @Transactional
    public boolean forceCancelBySeller(Integer orderId, Integer sellerUserId, String reason) {
        try {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) return false;

            // Already cancelled?
            if (order.getIsCancelled() != null && order.getIsCancelled()) return false;

            LocalDateTime now = LocalDateTime.now();
            order.setIsCancelled(true);
            order.setCancelledAt(now);
            order.setCancelledBy(sellerUserId);
            order.setCancelReason(reason == null ? "Cancelled by seller" : reason);
            order.setUpdatedAt(now);
            orderRepository.save(order);

            // Record history entry
            createOrderHistory(orderId, order.getStatus(), order.getStatus(), "cancelled_by_seller", "Order cancelled by seller: " + (reason == null ? "" : reason), String.valueOf(sellerUserId));

            return true;
        } catch (Exception e) {
            // swallow and return false to avoid throwing internal errors to caller
            return false;
        }
    }

    public List<OrderDTO> getOrdersByShopId(Integer shopId) {
        List<Order> orders = orderRepository.findByShopIdOrderByCreatedAtDesc(shopId);
        // Batch-load order items to avoid N+1 selects
        loadOrderItemsForOrders(orders);
        return orders.stream()
                .map(this::convertToOrderDTO)
                .collect(Collectors.toList());
    }

    // Helper: load order items for a list of orders in a single query and attach them
    private void loadOrderItemsForOrders(List<Order> orders) {
        if (orders == null || orders.isEmpty()) return;
        List<Integer> orderIds = orders.stream()
                .map(Order::getId)
                .collect(Collectors.toList());
        List<OrderItem> items = orderItemRepository.findByOrderIdIn(orderIds);
        Map<Integer, List<OrderItem>> itemsByOrder = items.stream()
                .collect(Collectors.groupingBy(OrderItem::getOrderId));
        for (Order o : orders) {
            List<OrderItem> list = itemsByOrder.get(o.getId());
            o.setOrderItems(list == null ? List.of() : list);
        }
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
                try {
                    // Prevent buyer from buying products of their own shop
                    var shopOpt = shopService.getShopById(determinedShopId);
                    if (shopOpt != null && shopOpt.isPresent()) {
                        Shop shop = shopOpt.get();
                        if (shop.getSellerId() == buyerId) {
                            Map<String, Object> errorResult = new HashMap<>();
                            errorResult.put("success", false);
                            errorResult.put("message", "Bạn không thể mua sản phẩm của chính cửa hàng bạn.");
                            return errorResult;
                        }
                    }
                } catch (Exception ex) {
                    // If shop lookup fails, continue (do not block order creation based on lookup failure)
                }
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
            Order savedOrder = orderRepository.save(order);
            
            
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
                        
                        // Validate unit price
                        if (unitPrice.compareTo(BigDecimal.ZERO) <= 0) {
                            throw new IllegalArgumentException("Unit price must be greater than 0");
                        }
                        if (unitPrice.precision() > 19) {
                            throw new IllegalArgumentException("Unit price has too many digits");
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
                
            }
            
            // Tự động phân phối đơn hàng cho seller và shipper
            // Auto-assigning order to seller and shipper
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
        dto.setDeliveryFee(order.getDeliveryFee());
        dto.setLatitude(order.getLatitude());
        dto.setLongitude(order.getLongitude());
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setAssignmentStatus(order.getAssignmentStatus());
    dto.setIsCancelled(order.getIsCancelled());
    dto.setCancelledAt(order.getCancelledAt());
    dto.setCancelReason(order.getCancelReason());
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