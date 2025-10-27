package com.example.demo.Orders;

import com.example.demo.Users.User;
import com.example.demo.Users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderAssignmentService {
    
    private final OrderRepository orderRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final UserRepository userRepository;

    @Autowired
    public OrderAssignmentService(OrderRepository orderRepository, 
                                OrderHistoryRepository orderHistoryRepository,
                                UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderHistoryRepository = orderHistoryRepository;
        this.userRepository = userRepository;
    }

    /**
     * Tự động phân phối đơn hàng cho seller
     */
    @Transactional
    public boolean assignOrderToSeller(Integer orderId, Integer sellerId) {
        try {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) {
                System.out.println("❌ Order not found: " + orderId);
                return false;
            }

            // Kiểm tra seller có tồn tại và có role seller không
            Optional<User> sellerOpt = userRepository.findById(sellerId);
            if (!sellerOpt.isPresent() || !sellerOpt.get().getRole().equals("seller")) {
                System.out.println("❌ Invalid seller: " + sellerId);
                return false;
            }

            // Cập nhật đơn hàng
            order.setAssignedSellerId(sellerId);
            order.setAssignmentStatus("assigned");
            order.setAssignedAt(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());
            
            orderRepository.save(order);

            // Tạo lịch sử
            createOrderHistory(orderId, null, "assigned", "order_assigned_to_seller", 
                "Đơn hàng được phân phối cho seller ID: " + sellerId, "system");

            System.out.println("✅ Order " + orderId + " assigned to seller " + sellerId);
            return true;

        } catch (Exception e) {
            System.err.println("❌ Error assigning order to seller: " + e.getMessage());
            return false;
        }
    }

    /**
     * Tự động phân phối đơn hàng cho shipper
     */
    @Transactional
    public boolean assignOrderToShipper(Integer orderId, Integer shipperId) {
        try {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) {
                System.out.println("❌ Order not found: " + orderId);
                return false;
            }

            // Kiểm tra shipper có tồn tại và có role shipper không
            Optional<User> shipperOpt = userRepository.findById(shipperId);
            if (!shipperOpt.isPresent() || !shipperOpt.get().getRole().equals("shipper")) {
                System.out.println("❌ Invalid shipper: " + shipperId);
                return false;
            }

            // Cập nhật đơn hàng
            order.setAssignedShipperId(shipperId);
            order.setAssignmentStatus("assigned");
            order.setAssignedAt(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());
            
            orderRepository.save(order);

            // Tạo lịch sử
            createOrderHistory(orderId, null, "assigned", "order_assigned_to_shipper", 
                "Đơn hàng được phân phối cho shipper ID: " + shipperId, "system");

            System.out.println("✅ Order " + orderId + " assigned to shipper " + shipperId);
            return true;

        } catch (Exception e) {
            System.err.println("❌ Error assigning order to shipper: " + e.getMessage());
            return false;
        }
    }

    /**
     * Seller/Shipper chấp nhận đơn hàng
     */
    @Transactional
    public boolean acceptOrder(Integer orderId, Integer userId) {
        try {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) {
                System.out.println("❌ Order not found: " + orderId);
                return false;
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                System.out.println("❌ User not found: " + userId);
                return false;
            }

            // Kiểm tra quyền
            boolean canAccept = false;
            if (user.getRole().equals("seller") && order.getAssignedSellerId() != null && order.getAssignedSellerId().equals(userId)) {
                canAccept = true;
                order.setStatus("confirmed");
            } else if (user.getRole().equals("shipper") && order.getAssignedShipperId() != null && order.getAssignedShipperId().equals(userId)) {
                canAccept = true;
                order.setStatus("shipping");
            }

            if (!canAccept) {
                System.out.println("❌ User " + userId + " cannot accept order " + orderId);
                return false;
            }

            // Cập nhật đơn hàng
            order.setAssignmentStatus("accepted");
            order.setAcceptedAt(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());
            
            orderRepository.save(order);

            // Tạo lịch sử
            String action = user.getRole().equals("seller") ? "order_accepted_by_seller" : "order_accepted_by_shipper";
            String description = user.getRole().equals("seller") ? 
                "Seller đã chấp nhận đơn hàng" : "Shipper đã chấp nhận đơn hàng";
            
            createOrderHistory(orderId, null, order.getStatus(), action, description, user.getEmail());

            System.out.println("✅ Order " + orderId + " accepted by " + user.getRole() + " " + userId);
            return true;

        } catch (Exception e) {
            System.err.println("❌ Error accepting order: " + e.getMessage());
            return false;
        }
    }

    /**
     * Seller/Shipper từ chối đơn hàng
     */
    @Transactional
    public boolean rejectOrder(Integer orderId, Integer userId, String reason) {
        try {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) {
                System.out.println("❌ Order not found: " + orderId);
                return false;
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                System.out.println("❌ User not found: " + userId);
                return false;
            }

            // Kiểm tra quyền
            boolean canReject = false;
            if (user.getRole().equals("seller") && order.getAssignedSellerId() != null && order.getAssignedSellerId().equals(userId)) {
                canReject = true;
                order.setAssignedSellerId(null);
            } else if (user.getRole().equals("shipper") && order.getAssignedShipperId() != null && order.getAssignedShipperId().equals(userId)) {
                canReject = true;
                order.setAssignedShipperId(null);
            }

            if (!canReject) {
                System.out.println("❌ User " + userId + " cannot reject order " + orderId);
                return false;
            }

            // Cập nhật đơn hàng
            order.setAssignmentStatus("rejected");
            order.setUpdatedAt(LocalDateTime.now());
            
            orderRepository.save(order);

            // Tạo lịch sử
            String action = user.getRole().equals("seller") ? "order_rejected_by_seller" : "order_rejected_by_shipper";
            String description = user.getRole().equals("seller") ? 
                "Seller đã từ chối đơn hàng. Lý do: " + reason : 
                "Shipper đã từ chối đơn hàng. Lý do: " + reason;
            
            createOrderHistory(orderId, null, "rejected", action, description, user.getEmail());

            System.out.println("✅ Order " + orderId + " rejected by " + user.getRole() + " " + userId);
            return true;

        } catch (Exception e) {
            System.err.println("❌ Error rejecting order: " + e.getMessage());
            return false;
        }
    }

    /**
     * Lấy danh sách đơn hàng được phân phối cho user
     */
    public List<Order> getAssignedOrders(Integer userId, String role) {
        if (role.equals("seller")) {
            return orderRepository.findByAssignedSellerIdAndAssignmentStatus(userId, "assigned");
        } else if (role.equals("shipper")) {
            return orderRepository.findByAssignedShipperIdAndAssignmentStatus(userId, "assigned");
        }
        return List.of();
    }

    /**
     * Tự động phân phối đơn hàng mới
     */
    @Transactional
    public void autoAssignNewOrder(Integer orderId) {
        try {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) return;

            // Tìm seller phù hợp (có thể dựa trên shop_id, location, workload, etc.)
            List<User> availableSellers = userRepository.findByRoleAndIsVerified("seller", true);
            if (!availableSellers.isEmpty()) {
                // Logic đơn giản: chọn seller đầu tiên
                // Trong thực tế có thể dựa trên workload, location, rating, etc.
                User selectedSeller = availableSellers.get(0);
                assignOrderToSeller(orderId, selectedSeller.getId());
            }

            // Tìm shipper phù hợp
            List<User> availableShippers = userRepository.findByRoleAndIsVerified("shipper", true);
            if (!availableShippers.isEmpty()) {
                User selectedShipper = availableShippers.get(0);
                assignOrderToShipper(orderId, selectedShipper.getId());
            }

        } catch (Exception e) {
            System.err.println("❌ Error in auto assignment: " + e.getMessage());
        }
    }

    private void createOrderHistory(Integer orderId, String statusFrom, String statusTo, 
                                  String action, String description, String createdBy) {
        try {
            OrderHistory history = new OrderHistory();
            history.setOrderId(orderId);
            history.setStatusFrom(statusFrom);
            history.setStatusTo(statusTo);
            history.setAction(action);
            history.setDescription(description);
            history.setCreatedBy(createdBy);
            history.setCreatedAt(LocalDateTime.now());
            
            orderHistoryRepository.save(history);
        } catch (Exception e) {
            System.err.println("❌ Error creating order history: " + e.getMessage());
        }
    }
}
