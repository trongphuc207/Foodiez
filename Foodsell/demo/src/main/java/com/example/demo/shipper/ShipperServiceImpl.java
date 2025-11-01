package com.example.demo.shipper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.Users.User;
import com.example.demo.Users.UserRepository;
import com.example.demo.Orders.Order;
import com.example.demo.Orders.OrderRepository;
import java.util.List;
import java.util.stream.Collectors;

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
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Shipper shipper = shipperRepository.findByUserId(user.getId().longValue())
            .orElseThrow(() -> new RuntimeException("Shipper not found"));

        List<Order> orders;
        if (status != null) {
            orders = orderRepository.findByAssignedShipperIdAndStatus(shipper.getId().intValue(), status);
        } else {
            orders = orderRepository.findByAssignedShipperId(shipper.getId().intValue());
        }

        return orders.stream()
            .map(this::convertToShipperOrderDTO)
            .collect(Collectors.toList());
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
                .mapToDouble(Order::getDeliveryFee)
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
        history.setChangedBy(user.getId().longValue());
        orderStatusHistoryRepository.save(history);
    }

    @Override
    @Transactional
    public void acceptOrder(Integer orderId, String username) {
        User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Shipper shipper = shipperRepository.findByUserId(user.getId().longValue())
            .orElseThrow(() -> new RuntimeException("Shipper not found"));

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getAssignedShipperId() != null) {
            throw new RuntimeException("Order already assigned to another shipper");
        }

        order.setAssignedShipperId(shipper.getId().intValue());
        order.setStatus("accepted");
        orderRepository.save(order);

        // Save status history
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrderId(orderId);
        history.setStatus("accepted");
        history.setChangedBy(user.getId().longValue());
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
        dto.setTime(order.getCreatedAt());
        dto.setPickupAddress(order.getShop().getAddress());
        dto.setDeliveryAddress(order.getAddressText());
        dto.setItems(order.getOrderItems().size());
        dto.setDistance(calculateDistance(order));
        dto.setPrice(formatCurrency(order.getDeliveryFee()));
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
        dto.setEarnings(formatCurrency(order.getDeliveryFee()));
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