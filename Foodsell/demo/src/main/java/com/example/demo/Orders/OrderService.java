package com.example.demo.Orders;

import com.example.demo.dto.OrderDTO;
import com.example.demo.dto.OrderItemDTO;
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
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
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
    public Map<String, Object> createOrder(Map<String, Object> deliveryInfo, Map<String, Object> paymentInfo, 
                                          List<Map<String, Object>> cartItems, Integer payosOrderCode, 
                                          Integer totalAmount, String status) {
        try {
            System.out.println("Creating order with PayOS order code: " + payosOrderCode);
            
            // Create new order
            Order order = new Order();
            order.setBuyerId(1); // Default buyer ID - you might want to get this from authentication
            order.setShopId(1); // Default shop ID - you might want to get this from cart items
            order.setDeliveryAddressId(1); // Default address ID
            order.setTotalAmount(new BigDecimal(totalAmount));
            order.setStatus(status);
            
            // Set delivery information
            if (deliveryInfo != null) {
                order.setRecipientName((String) deliveryInfo.get("recipientName"));
                order.setRecipientPhone((String) deliveryInfo.get("recipientPhone"));
                order.setAddressText((String) deliveryInfo.get("addressText"));
            }
            
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
                    
                    orderItem.setProductId(productId);
                    orderItem.setQuantity(quantity);
                    orderItem.setUnitPrice(unitPrice);
                    
                    orderItemRepository.save(orderItem);
                    System.out.println("✅ Created order item: Product " + productId + ", Qty " + quantity + ", Price " + unitPrice);
                }
                System.out.println("✅ Created " + cartItems.size() + " order items");
            }
            
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
        
        // Convert order items
        if (order.getOrderItems() != null) {
            List<OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                    .map(this::convertToOrderItemDTO)
                    .collect(Collectors.toList());
            dto.setOrderItems(itemDTOs);
        }
        
        return dto;
    }
    
    // Convert OrderItem entity to OrderItemDTO
    private OrderItemDTO convertToOrderItemDTO(OrderItem orderItem) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(orderItem.getId());
        dto.setOrderId(orderItem.getOrderId());
        dto.setProductId(orderItem.getProductId());
        dto.setQuantity(orderItem.getQuantity());
        dto.setUnitPrice(orderItem.getUnitPrice());
        dto.setTotalPrice(orderItem.getTotalPrice());
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
                
                // Update order status based on payment status
                if ("PAID".equals(status)) {
                    order.setStatus("paid");
                    System.out.println("✅ Order " + order.getId() + " marked as PAID");
                } else if ("CANCELLED".equals(status)) {
                    order.setStatus("cancelled");
                    System.out.println("❌ Order " + order.getId() + " marked as CANCELLED");
                } else if ("EXPIRED".equals(status)) {
                    order.setStatus("expired");
                    System.out.println("⏰ Order " + order.getId() + " marked as EXPIRED");
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
}