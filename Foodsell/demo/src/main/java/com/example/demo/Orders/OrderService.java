package com.example.demo.Orders;

import com.example.demo.dto.OrderDTO;
import com.example.demo.dto.OrderItemDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
}