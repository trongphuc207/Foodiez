package com.example.demo.shipper;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AcceptOrderRequest {
    @NotNull(message = "Order ID is required")
    private Integer orderId;
    
    @Size(max = 500, message = "Note cannot exceed 500 characters")
    private String note;
    
    private Double currentLat;    // Vị trí hiện tại của shipper
    private Double currentLng;
    
    private Boolean isAvailable;  // Trạng thái sẵn sàng nhận đơn
    
    private String vehicleType;   // Loại phương tiện giao hàng
    
    @Min(value = 0, message = "Current orders must be >= 0")
    private Integer currentActiveOrders; // Số đơn hàng đang giao
    
    private LocalDateTime expectedPickupTime; // Thời gian dự kiến lấy hàng
    
    private LocalDateTime expectedDeliveryTime; // Thời gian dự kiến giao hàng
    
    private String preferredArea; // Khu vực ưu tiên nhận đơn
    
    private Double maxAcceptableDistance; // Khoảng cách tối đa có thể nhận đơn (km)
    
    public AcceptOrderRequest() {
        this.isAvailable = true;  // Mặc định là sẵn sàng nhận đơn
        this.currentActiveOrders = 0;
        this.maxAcceptableDistance = 5.0; // Mặc định 5km
    }
    
    // Constructor với các tham số bắt buộc
    public AcceptOrderRequest(Integer orderId, String note) {
        this.orderId = orderId;
        this.note = note;
        this.isAvailable = true;
        this.currentActiveOrders = 0;
        this.maxAcceptableDistance = 5.0;
    }
    
    // Kiểm tra xem shipper có ở gần địa điểm lấy hàng không
    public boolean isNearPickupLocation(Double shopLat, Double shopLng) {
        if (currentLat == null || currentLng == null || shopLat == null || shopLng == null) {
            return false;
        }
        double distance = calculateDistance(currentLat, currentLng, shopLat, shopLng);
        return distance <= maxAcceptableDistance;
    }
    
    // Kiểm tra khả năng nhận thêm đơn hàng
    public boolean canAcceptMoreOrders() {
        return currentActiveOrders < 2; // Giới hạn 2 đơn cùng lúc
    }
    
    // Kiểm tra có phù hợp với khu vực không
    public boolean isInPreferredArea(String orderArea) {
        if (preferredArea == null || orderArea == null) {
            return true; // Nếu không có preference thì accept tất cả
        }
        return preferredArea.equalsIgnoreCase(orderArea);
    }
    
    // Tính khoảng cách giữa hai điểm (km)
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        int R = 6371; // Bán kính trái đất (km)
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    // Cập nhật thời gian dự kiến
    public void updateExpectedTimes(LocalDateTime pickupTime, double distanceToShop, double distanceToCustomer) {
        this.expectedPickupTime = pickupTime;
        // Ước tính thời gian giao hàng (giả sử tốc độ trung bình 30km/h)
        double totalTime = (distanceToShop + distanceToCustomer) / 30.0; // Giờ
        this.expectedDeliveryTime = pickupTime.plusMinutes((long)(totalTime * 60));
    }
}
}