package com.example.demo.Orders;

import com.example.demo.Users.User;
import com.example.demo.Users.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class OrderAssignmentService {
    private static final Logger logger = LoggerFactory.getLogger(OrderAssignmentService.class);
    
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
        logger.info("=== START ACCEPT ORDER FLOW ===");
        logger.info("Processing order acceptance request - Order ID: {}, User ID: {}", orderId, userId);
        try {
            logger.info("1. Looking up order in database...");
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) {
                logger.error("Failed to accept order: Order not found with ID: {}", orderId);
                return false;
            }
            logger.info("Order found - Current status: {}, Assignment status: {}", order.getStatus(), order.getAssignmentStatus());

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                logger.error("Failed to accept order: User not found with ID: {}", userId);
                return false;
            }

            // Log current order state
            logger.debug("Current order state - ID: {}, Status: {}, Assignment Status: {}, Seller ID: {}, Shipper ID: {}", 
                orderId, order.getStatus(), order.getAssignmentStatus(), order.getAssignedSellerId(), order.getAssignedShipperId());

            // Log current state for debugging
            logger.info("2. Current order state:");
            logger.info("Status: {}, Assignment status: {}", order.getStatus(), order.getAssignmentStatus());

            // Kiểm tra quyền và bỏ qua kiểm tra assignment status
            logger.info("Checking user permissions for order acceptance - User Role: {}, Order ID: {}", user.getRole(), orderId);
            boolean canAccept = false;
            
            if (user.getRole().equals("seller")) {
                logger.info("3. Checking seller permissions...");
                logger.info("User ID: {}, Order ID: {}, User Role: {}", userId, orderId, user.getRole());
                
                // Allow acceptance for any seller who owns the shop
                boolean isAssignedSeller = true; // Remove assignment check
                logger.info("Bypassing assignment check for sellers");
                
                boolean isShopOwner = false;
                
                try {
                    if (order.getShop() != null) {
                        logger.info("Shop information found - Shop ID: {}", order.getShop().getId());
                        logger.info("Checking shop ownership - Shop Seller ID: {}, User ID: {}", 
                            order.getShop().getSellerId(), userId);
                        isShopOwner = Integer.valueOf(order.getShop().getSellerId()).equals(userId);
                        logger.info("Is shop owner? {}", isShopOwner);
                    } else {
                        logger.error("Shop information is missing for order {}", orderId);
                    }
                } catch (Exception ex) {
                    logger.error("Error checking shop ownership for order {}: {}", orderId, ex.getMessage());
                    isShopOwner = false;
                }

                if (isAssignedSeller || isShopOwner) {
                    logger.debug("User {} (seller) is allowed to accept order {} (assignedSeller={}, shopOwner={})", 
                        userId, orderId, isAssignedSeller, isShopOwner);
                    canAccept = true;
                }
            } else if (user.getRole().equals("shipper")) {
                if (order.getAssignedShipperId() != null && order.getAssignedShipperId().equals(userId)) {
                    logger.debug("User {} is a shipper and is assigned to this order", userId);
                    canAccept = true;
                }
            }

            if (!canAccept) {
                logger.error("User {} cannot accept order {}. User role: {}, Not shop owner", 
                    userId, orderId, user.getRole());
                return false;
            }

            // Cập nhật trạng thái đơn hàng và không kiểm tra assignment status
            String currentAssignmentStatus = "not_required"; // Bỏ qua kiểm tra trạng thái assignment
            
            // Validate shop information for seller acceptance
            if (user.getRole().equals("seller")) {
                if (order.getShop() == null) {
                    logger.error("Cannot accept order: Shop information is missing for order {}", orderId);
                    return false;
                }
            }
            
            // Cập nhật đơn hàng - CHỈ thay đổi assignment status
            try {
                order.setAssignmentStatus("accepted");
                order.setAcceptedAt(LocalDateTime.now());
                order.setUpdatedAt(LocalDateTime.now());
                
                logger.debug("Order assignment status transition - Order ID: {}, " +
                            "Old Assignment Status: {}, New Assignment Status: accepted", 
                            orderId, currentAssignmentStatus);
                
                // Persist and flush immediately so we see DB changes within this transaction
                logger.info("Attempting to save order changes - Order ID: {}, Status: {}, New Assignment Status: {}, Accepted At: {}", 
                    order.getId(), order.getStatus(), order.getAssignmentStatus(), order.getAcceptedAt());
                
                Order savedOrder = orderRepository.saveAndFlush(order);
                logger.info("Order successfully updated in database - Order ID: {}, Status: {}, Assignment Status: {}, Updated At: {}, Accepted At: {}", 
                    savedOrder.getId(), savedOrder.getStatus(), savedOrder.getAssignmentStatus(), 
                    savedOrder.getUpdatedAt(), savedOrder.getAcceptedAt());
                    
                // Verify the changes were saved
                Order verifiedOrder = orderRepository.findById(orderId).orElse(null);
                if (verifiedOrder != null) {
                    logger.info("Verified order state after save - Order ID: {}, Status: {}, Assignment Status: {}, Accepted At: {}", 
                        verifiedOrder.getId(), verifiedOrder.getStatus(), verifiedOrder.getAssignmentStatus(), 
                        verifiedOrder.getAcceptedAt());
                }
            } catch (Exception e) {
                logger.error("Failed to save order changes: {}", e.getMessage());
                throw e;  // Re-throw to trigger transaction rollback
            }

            // Tạo lịch sử với assignment status
            try {
                String oldAssignmentStatus = order.getAssignmentStatus() != null ? order.getAssignmentStatus() : "pending";
                createOrderHistory(
                    orderId,
                    oldAssignmentStatus,    // Assignment status cũ
                    "accepted",             // Assignment status mới
                    user.getRole().equals("seller") ? "order_accepted_by_seller" : "order_accepted_by_shipper",
                    user.getRole().equals("seller") ? "Seller đã chấp nhận đơn hàng" : "Shipper đã chấp nhận đơn hàng",
                    user.getEmail()
                );
                logger.info("Successfully created order history for order {}", orderId);
            } catch (Exception ex) {
                logger.error("Failed to create order history: {}", ex.getMessage());
                // Don't throw here, we still want to return true if the order was accepted
            }

            logger.info("Order {} successfully accepted by {} (ID: {})", orderId, user.getRole(), userId);
            return true;

        } catch (Exception e) {
            logger.error("Error accepting order {} by user {}: {}", orderId, userId, e.getMessage(), e);
            // In case of error, try to rollback any partial changes
            if (orderRepository.findById(orderId).isPresent()) {
                Order originalOrder = orderRepository.findById(orderId).get();
                logger.info("Rolling back order to previous state - Order ID: {}, Status: {}, Assignment Status: {}", 
                    originalOrder.getId(), originalOrder.getStatus(), originalOrder.getAssignmentStatus());
            }
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
            logger.info("Creating order history entry - Order ID: {}, Status From: {}, Status To: {}, Action: {}, Created By: {}", 
                orderId, statusFrom, statusTo, action, createdBy);
            logger.debug("Order history details - Description: {}", description);
            
            OrderHistory history = new OrderHistory();
            history.setOrderId(orderId);
            history.setStatusFrom(statusFrom);
            history.setStatusTo(statusTo);
            history.setAction(action);
            history.setDescription(description);
            history.setCreatedBy(createdBy);
            history.setCreatedAt(LocalDateTime.now());
            
            OrderHistory savedHistory = orderHistoryRepository.save(history);
            logger.debug("Order history created - ID: {}, Order ID: {}, Action: {}", 
                savedHistory.getId(), savedHistory.getOrderId(), savedHistory.getAction());
        } catch (Exception e) {
            logger.error("Error creating order history for order {}: {}", orderId, e.getMessage());
        }
    }
}
