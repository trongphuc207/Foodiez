package com.example.demo;

import com.example.demo.dto.*;
import com.example.demo.Orders.*;
import com.example.demo.products.ProductRepository;
import com.example.demo.Users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SellerService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrderHistoryRepository orderHistoryRepository;
    
    // Get dashboard statistics
    public SellerDashboardDTO getDashboardStats(Integer shopId) {
        LocalDateTime today = LocalDate.now().atStartOfDay();
        LocalDateTime tomorrow = today.plusDays(1);
        
        // Total orders
        Integer totalOrders = (int) orderRepository.countByShopId(shopId);
        
        // Today orders
        List<Order> todayOrdersList = orderRepository.findByShopIdBetweenDates(shopId, today, tomorrow);
        Integer todayOrders = todayOrdersList.size();
        
        // Total revenue
        List<Order> allOrders = orderRepository.findByShopIdOrderByCreatedAtDesc(shopId);
        BigDecimal totalRevenue = allOrders.stream()
            .filter(o -> !"cancelled".equals(o.getStatus()))
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Today revenue
        BigDecimal todayRevenue = todayOrdersList.stream()
            .filter(o -> !"cancelled".equals(o.getStatus()))
            .map(Order::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Orders by status
        Integer pendingOrders = (int) orderRepository.countByShopIdAndStatus(shopId, "pending");
        Integer completedOrders = (int) orderRepository.countByShopIdAndStatus(shopId, "delivered");
        Integer cancelledOrders = (int) orderRepository.countByShopIdAndStatus(shopId, "cancelled");
        
        // Products
        Integer totalProducts = (int) productRepository.countByShopId(shopId);
        Integer activeProducts = (int) productRepository.countByShopIdAndStatus(shopId, "active");
        
        // Unique customers
        Set<Integer> uniqueBuyers = allOrders.stream()
            .map(Order::getBuyerId)
            .collect(Collectors.toSet());
        Integer totalCustomers = uniqueBuyers.size();
        
        return new SellerDashboardDTO(
            totalOrders, todayOrders, totalRevenue, todayRevenue,
            pendingOrders, completedOrders, cancelledOrders,
            totalProducts, activeProducts, totalCustomers
        );
    }
    
    // Get orders with optional status filter
    public List<SellerOrderDTO> getOrders(Integer shopId, String status) {
        List<Order> orders;
        if (status != null && !status.isEmpty()) {
            orders = orderRepository.findByShopIdAndStatusOrderByCreatedAtDesc(shopId, status);
        } else {
            orders = orderRepository.findByShopIdWithOrderItems(shopId);
        }
        
        return orders.stream().map(this::convertToSellerOrderDTO).collect(Collectors.toList());
    }
    
    // Convert Order to SellerOrderDTO
    private SellerOrderDTO convertToSellerOrderDTO(Order order) {
        SellerOrderDTO dto = new SellerOrderDTO();
        dto.setId(order.getId());
        dto.setBuyerId(order.getBuyerId());
        dto.setRecipientName(order.getRecipientName());
        dto.setRecipientPhone(order.getRecipientPhone());
        dto.setAddressText(order.getAddressText());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setNotes(order.getNotes());
        dto.setCreatedAt(order.getCreatedAt());
        
        // Get buyer name
        userRepository.findById(order.getBuyerId()).ifPresent(user -> {
            dto.setBuyerName(user.getFullName());
        });
        
        // Get order items
        if (order.getOrderItems() != null) {
            List<SellerOrderDTO.OrderItemInfo> items = order.getOrderItems().stream()
                .map(item -> {
                    String productName = productRepository.findById(item.getProductId())
                        .map(p -> p.getName())
                        .orElse("Unknown Product");
                    return new SellerOrderDTO.OrderItemInfo(productName, item.getQuantity(), item.getUnitPrice());
                })
                .collect(Collectors.toList());
            dto.setItems(items);
        }
        
        return dto;
    }
    
    // Update order status
    @Transactional
    public Order updateOrderStatus(Integer orderId, String status, String notes) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));
        String oldStatus = order.getStatus();

        order.setStatus(status);
        if (notes != null && !notes.isEmpty()) {
            String currentNotes = order.getNotes() != null ? order.getNotes() : "";
            order.setNotes(currentNotes + "\n" + notes);
        }
        order.setUpdatedAt(LocalDateTime.now());

        Order saved = orderRepository.save(order);

        // create order history entry
        try {
            OrderHistory history = new OrderHistory(
                saved.getId(),
                oldStatus,
                status,
                "SELLER_UPDATE",
                (notes == null || notes.isEmpty()) ? "Seller updated status" : notes,
                "SELLER"
            );
            orderHistoryRepository.save(history);
        } catch (Exception e) {
            // Do not break main flow if history fails
            System.err.println("Failed to create order history: " + e.getMessage());
        }

        return saved;
    }
    
    // Get daily revenue
    public RevenueDTO getDailyRevenue(Integer shopId, Integer days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);
        
        List<Order> orders = orderRepository.findByShopIdBetweenDates(shopId, startDate, endDate);
        
        // Group by date
        Map<LocalDate, List<Order>> ordersByDate = orders.stream()
            .filter(o -> !"cancelled".equals(o.getStatus()))
            .collect(Collectors.groupingBy(o -> o.getCreatedAt().toLocalDate()));
        
        List<RevenueDTO.RevenueItemDTO> revenueList = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        
        // Create entry for each day (even if no orders)
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            List<Order> dayOrders = ordersByDate.getOrDefault(date, Collections.emptyList());
            
            BigDecimal dayRevenue = dayOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            revenueList.add(new RevenueDTO.RevenueItemDTO(
                date.format(formatter),
                null,
                dayRevenue,
                dayOrders.size()
            ));
        }
        
        BigDecimal totalRevenue = revenueList.stream()
            .map(RevenueDTO.RevenueItemDTO::getRevenue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Integer totalOrders = revenueList.stream()
            .map(RevenueDTO.RevenueItemDTO::getOrderCount)
            .reduce(0, Integer::sum);
        
        return new RevenueDTO(totalRevenue, totalOrders, revenueList);
    }
    
    // Get monthly revenue
    public RevenueDTO getMonthlyRevenue(Integer shopId, Integer year) {
        LocalDateTime startDate = LocalDateTime.of(year, 1, 1, 0, 0);
        LocalDateTime endDate = LocalDateTime.of(year, 12, 31, 23, 59);
        
        List<Order> orders = orderRepository.findByShopIdBetweenDates(shopId, startDate, endDate);
        
        // Group by month
        Map<Integer, List<Order>> ordersByMonth = orders.stream()
            .filter(o -> !"cancelled".equals(o.getStatus()))
            .collect(Collectors.groupingBy(o -> o.getCreatedAt().getMonthValue()));
        
        List<RevenueDTO.RevenueItemDTO> revenueList = new ArrayList<>();
        
        for (int month = 1; month <= 12; month++) {
            List<Order> monthOrders = ordersByMonth.getOrDefault(month, Collections.emptyList());
            
            BigDecimal monthRevenue = monthOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            revenueList.add(new RevenueDTO.RevenueItemDTO(
                null,
                "Tháng " + month,
                monthRevenue,
                monthOrders.size()
            ));
        }
        
        BigDecimal totalRevenue = revenueList.stream()
            .map(RevenueDTO.RevenueItemDTO::getRevenue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Integer totalOrders = revenueList.stream()
            .map(RevenueDTO.RevenueItemDTO::getOrderCount)
            .reduce(0, Integer::sum);
        
        return new RevenueDTO(totalRevenue, totalOrders, revenueList);
    }
    
    // Get customers
    public List<CustomerDTO> getCustomers(Integer shopId) {
        List<Order> orders = orderRepository.findByShopIdOrderByCreatedAtDesc(shopId);
        
        // Group by buyer
        Map<Integer, List<Order>> ordersByBuyer = orders.stream()
            .collect(Collectors.groupingBy(Order::getBuyerId));
        
        List<CustomerDTO> customers = new ArrayList<>();
        
        for (Map.Entry<Integer, List<Order>> entry : ordersByBuyer.entrySet()) {
            Integer buyerId = entry.getKey();
            List<Order> buyerOrders = entry.getValue();
            
            userRepository.findById(buyerId).ifPresent(user -> {
                BigDecimal totalSpent = buyerOrders.stream()
                    .filter(o -> !"cancelled".equals(o.getStatus()))
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                LocalDateTime lastOrderDate = buyerOrders.stream()
                    .map(Order::getCreatedAt)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);
                
                customers.add(new CustomerDTO(
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getPhone(),
                    buyerOrders.size(),
                    totalSpent,
                    lastOrderDate
                ));
            });
        }
        
        // Sort by total spent descending
        customers.sort((a, b) -> b.getTotalSpent().compareTo(a.getTotalSpent()));
        
        return customers;
    }
    
    // Get top customers
    public List<CustomerDTO> getTopCustomers(Integer shopId, Integer limit) {
        List<CustomerDTO> customers = getCustomers(shopId);
        return customers.stream().limit(limit).collect(Collectors.toList());
    }
    
    // Get best selling products
    public List<BestSellingProductDTO> getBestSellingProducts(Integer shopId, Integer limit) {
        List<Order> orders = orderRepository.findByShopIdOrderByCreatedAtDesc(shopId);
        
        // Get all order items from these orders
        List<Integer> orderIds = orders.stream().map(Order::getId).collect(Collectors.toList());
        
        // Group by product and sum quantities
        Map<Integer, Integer> productQuantities = new HashMap<>();
        Map<Integer, BigDecimal> productRevenues = new HashMap<>();
        
        for (Order order : orders) {
            if ("cancelled".equals(order.getStatus())) continue;
            
            if (order.getOrderItems() != null) {
                for (OrderItem item : order.getOrderItems()) {
                    Integer productId = item.getProductId();
                    productQuantities.merge(productId, item.getQuantity(), Integer::sum);
                    
                    BigDecimal itemRevenue = item.getUnitPrice().multiply(new BigDecimal(item.getQuantity()));
                    productRevenues.merge(productId, itemRevenue, BigDecimal::add);
                }
            }
        }
        
        // Create DTOs
        List<BestSellingProductDTO> bestSelling = new ArrayList<>();
        for (Map.Entry<Integer, Integer> entry : productQuantities.entrySet()) {
            Integer productId = entry.getKey();
            Integer totalSold = entry.getValue();
            BigDecimal revenue = productRevenues.get(productId);
            
            productRepository.findById(productId).ifPresent(product -> {
                bestSelling.add(new BestSellingProductDTO(
                    product.getId(),
                    product.getName(),
                    totalSold,
                    revenue,
                    product.getImageUrl()
                ));
            });
        }
        
        // Sort by total sold descending
        bestSelling.sort((a, b) -> b.getTotalSold().compareTo(a.getTotalSold()));
        
        return bestSelling.stream().limit(limit).collect(Collectors.toList());
    }
}

