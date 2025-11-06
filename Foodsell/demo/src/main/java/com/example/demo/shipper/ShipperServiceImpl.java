package com.example.demo.shipper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.Users.User;
import com.example.demo.Users.UserRepository;
import com.example.demo.Orders.Order;
import com.example.demo.Orders.OrderRepository;
import com.example.demo.order.OrderStatusHistory;
import com.example.demo.order.OrderStatusHistoryRepository;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
public class ShipperServiceImpl implements ShipperService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShipperRepository shipperRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Override
    public List<ShipperOrderDTO> getShipperOrders(String username, String status) {
    // lookup user
    User user = userRepository.findByEmail(username)
        .orElseThrow(() -> new RuntimeException("User not found with email: " + username));
        Shipper shipper = shipperRepository.findByUserId(user.getId().longValue())
            .orElseThrow(() -> new RuntimeException("Shipper not found for user: " + user.getId()));

        List<Order> orders = new ArrayList<>();

        if (status != null) {
            // Nếu truyền status, chỉ lấy đơn đã gán cho shipper với status đó
            List<Order> assignedWithStatus = orderRepository.findByAssignedShipperIdAndStatus(shipper.getId().intValue(), status);
            orders.addAll(assignedWithStatus);
        } else {
            // Nếu không truyền status, lấy cả hai loại:
            // 1. Đơn đã gán cho shipper hiện tại
            List<Order> assignedToShipper = orderRepository.findByAssignedShipperId(shipper.getId().intValue());
            // 2. Đơn có assignment_status = 'accepted' và chưa gán shipper
            List<Order> acceptedUnassigned = orderRepository.findByAssignmentStatusAndAssignedShipperIdIsNullOrderByCreatedAtDesc("accepted");
            orders.addAll(assignedToShipper);
            orders.addAll(acceptedUnassigned);
        }

        // Loại bỏ trùng lặp theo order id
        List<Order> uniqueOrders = orders.stream()
            .collect(Collectors.toMap(Order::getId, o -> o, (o1, o2) -> o1))
            .values().stream().collect(Collectors.toList());

        return uniqueOrders.stream()
            .map(this::convertToShipperOrderDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<ShipperOrderDTO> getAvailableOrders(String username, String keyword, String area) {
        // Returns orders that sellers have accepted and are not yet assigned to any shipper.
        // Optional keyword search (notes, recipientName, addressText) and optional area filter (simple substring match on address_text)
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Verify shipper exists (but don't need to store it)
        shipperRepository.findByUserId(user.getId().longValue())
            .orElseThrow(() -> new RuntimeException("Shipper not found"));

        List<Order> available;
        if (keyword != null && !keyword.trim().isEmpty()) {
            available = orderRepository.searchAvailableOrdersByKeyword("accepted", keyword.trim());
        } else {
            available = orderRepository.findByAssignmentStatusAndAssignedShipperIdIsNullOrderByCreatedAtDesc("accepted");
        }

        // If area filter provided, simple substring match on shop address or order address
        if (area != null && !area.trim().isEmpty()) {
            String a = area.trim().toLowerCase();
            available = available.stream()
                .filter(o -> (o.getShop() != null && o.getShop().getAddress() != null && o.getShop().getAddress().toLowerCase().contains(a))
                              || (o.getAddressText() != null && o.getAddressText().toLowerCase().contains(a)))
                .collect(Collectors.toList());
        }

        // TODO: Could sort by distance to shipper if shipper/location available. For now return as-is (recent first)
        return available.stream().map(this::convertToShipperOrderDTO).collect(Collectors.toList());
    }

    @Override
    public ShipperDashboardDTO getShipperDashboard(String username) {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Shipper shipper = shipperRepository.findByUserId(user.getId().longValue())
            .orElseThrow(() -> new RuntimeException("Shipper not found"));

        List<Order> orders = orderRepository.findByAssignedShipperId(shipper.getId().intValue());
        
        ShipperDashboardDTO dashboard = new ShipperDashboardDTO();
        dashboard.setTotalOrders(orders.size());
        dashboard.setDeliveredOrders((int) orders.stream()
            .filter(o -> "delivered".equals(o.getStatus()))
            .count());
        dashboard.setDeliveringOrders((int) orders.stream()
            .filter(o -> "delivering".equals(o.getStatus()))
            .count());
        dashboard.setTotalEarnings(formatCurrency(
            orders.stream()
                .filter(o -> "delivered".equals(o.getStatus()))
                .map(o -> o.getDeliveryFee() != null ? o.getDeliveryFee().doubleValue() : 0.0)
                .mapToDouble(Double::doubleValue)
                .sum()
        ));

        return dashboard;
    }

    @Override
    @Transactional
    public void updateOrderStatus(Integer orderId, String status, String note, String username) {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Shipper shipper = shipperRepository.findByUserId(user.getId().longValue())
            .orElseThrow(() -> new RuntimeException("Shipper not found"));

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        if (shipper.getId().intValue() != order.getAssignedShipperId()) {
            throw new RuntimeException("Not authorized to update this order");
        }

        order.setStatus(status);
        orderRepository.save(order);

        // Save status history
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrderId(orderId);
        history.setStatus(status);
        history.setNotes(note);
    history.setChangedBy(user.getId().intValue());
        orderStatusHistoryRepository.save(history);
    }

    @Override
    @Transactional
    public void acceptOrder(Integer orderId, String username, String note) {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Shipper shipper = shipperRepository.findByUserId(user.getId().longValue())
            .orElseThrow(() -> new RuntimeException("Shipper not found"));

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getAssignedShipperId() != null) {
            throw new RuntimeException("Order already assigned to another shipper");
        }

        // Assign to this shipper and update assignment status
    order.setAssignedShipperId(shipper.getId().intValue());
    order.setAssignmentStatus("assigned");
    order.setAssignedAt(LocalDateTime.now());
        // Optionally set delivery workflow status (e.g. delivering) depending on your flow. Keep existing status unchanged if you prefer.
        orderRepository.save(order);

        // Save status history
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrderId(orderId);
        history.setStatus("assigned");
        history.setChangedBy(user.getId().intValue());
        history.setNotes(note);
        orderStatusHistoryRepository.save(history);
    }

    @Override
    public ShipperEarningsDTO getShipperEarnings(String username) {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Shipper shipper = shipperRepository.findByUserId(user.getId().longValue())
            .orElseThrow(() -> new RuntimeException("Shipper not found"));

        // Implementation for earnings calculation
        ShipperEarningsDTO earnings = new ShipperEarningsDTO();
        earnings.setDailyEarnings(formatCurrency(shipperRepository.calculateDailyEarnings(shipper.getId())));
        earnings.setWeeklyEarnings(formatCurrency(shipperRepository.calculateWeeklyEarnings(shipper.getId())));
        earnings.setMonthlyEarnings(formatCurrency(shipperRepository.calculateMonthlyEarnings(shipper.getId())));
        earnings.setCompletedOrders(shipperRepository.countCompletedOrders(shipper.getId()));
        earnings.setAverageRating(shipper.getRating());

        return earnings;
    }

    @Override
    public List<DeliveryHistoryDTO> getDeliveryHistory(String username) {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Shipper shipper = shipperRepository.findByUserId(user.getId().longValue())
            .orElseThrow(() -> new RuntimeException("Shipper not found"));

        return orderRepository.findCompletedOrdersByShipperId(shipper.getId().intValue())
            .stream()
            .map(this::convertToDeliveryHistoryDTO)
            .collect(Collectors.toList());
    }

    @Override
    public ShipperProfileDTO getShipperProfile(String username) {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Shipper shipper = shipperRepository.findByUserId(user.getId().longValue())
            .orElseThrow(() -> new RuntimeException("Shipper not found"));

        return convertToShipperProfileDTO(shipper);
    }

    private ShipperOrderDTO convertToShipperOrderDTO(Order order) {
        ShipperOrderDTO dto = new ShipperOrderDTO();
        dto.setId(String.valueOf(order.getId()));
        dto.setCustomer(order.getRecipientName());
        dto.setPhone(order.getRecipientPhone());
        dto.setStatus(order.getStatus());
        dto.setAssignmentStatus(order.getAssignmentStatus());
        dto.setAssignedShipperId(order.getAssignedShipperId());
        dto.setTime(order.getCreatedAt());
        dto.setPickupAddress(order.getShop().getAddress());
        dto.setDeliveryAddress(order.getAddressText());
        dto.setItems(order.getOrderItems().size());
        dto.setDistance(calculateDistance(order));
        dto.setPrice(formatCurrency(order.getDeliveryFee() != null ? order.getDeliveryFee().doubleValue() : 0.0));
        dto.setNote(order.getNotes());
        return dto;
    }

    private DeliveryHistoryDTO convertToDeliveryHistoryDTO(Order order) {
        DeliveryHistoryDTO dto = new DeliveryHistoryDTO();
        dto.setOrderId(String.valueOf(order.getId()));
        dto.setCustomerName(order.getRecipientName());
        dto.setDeliveryAddress(order.getAddressText());
        dto.setStatus(order.getStatus());
        dto.setCompletedAt(order.getUpdatedAt());
        dto.setEarnings(formatCurrency(order.getDeliveryFee() != null ? order.getDeliveryFee().doubleValue() : 0.0));
        dto.setDistance(calculateDistance(order));
        return dto;
    }

    private ShipperProfileDTO convertToShipperProfileDTO(Shipper shipper) {
    ShipperProfileDTO dto = new ShipperProfileDTO();
    dto.setId(shipper.getId());
    // User stores full name in `fullName` field
    dto.setName(shipper.getUser().getFullName());
        dto.setPhone(shipper.getUser().getPhone());
        dto.setVehicleType(shipper.getVehicleType());
        dto.setLicensePlate(shipper.getLicensePlate());
        dto.setDeliveryArea(shipper.getDeliveryArea());
        dto.setIsAvailable(shipper.getIsAvailable());
        dto.setRating(shipper.getRating());
        dto.setTotalDeliveries(shipper.getTotalDeliveries());
        dto.setTotalEarnings(shipper.getTotalEarnings());
        return dto;
    }

    private String calculateDistance(Order order) {
        // Implementation for distance calculation using latitude/longitude
        // Null-safe conversion of coordinates (Shop lat/lon are Double, Order lat/lon are BigDecimal)
        double shopLat = 0.0, shopLon = 0.0, orderLat = 0.0, orderLon = 0.0;
        if (order.getShop() != null) {
            if (order.getShop().getLatitude() != null) shopLat = order.getShop().getLatitude();
            if (order.getShop().getLongitude() != null) shopLon = order.getShop().getLongitude();
        }
        if (order.getLatitude() != null) orderLat = order.getLatitude().doubleValue();
        if (order.getLongitude() != null) orderLon = order.getLongitude().doubleValue();

        double distance = calculateDistanceInKm(shopLat, shopLon, orderLat, orderLon);
        return String.format("%.1f km", distance);
    }

    private double calculateDistanceInKm(double lat1, double lon1, double lat2, double lon2) {
        // Haversine formula implementation
        int R = 6371; // Earth's radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    private String formatCurrency(double amount) {
        return String.format("%,.0f₫", amount);
    }
}