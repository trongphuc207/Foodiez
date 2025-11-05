package com.example.demo.Shipper;

import com.example.demo.Users.User;
import com.example.demo.Users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ShipperService {
    
    @Autowired
    private ShipperRepository shipperRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Tạo profile shipper mới
    public Shipper createShipperProfile(Integer userId, String vehicleType, String licensePlate, String deliveryArea) {
        // Kiểm tra user có tồn tại không
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        // Kiểm tra user đã có profile shipper chưa
        Optional<Shipper> existingShipper = shipperRepository.findByUserId(userId);
        if (existingShipper.isPresent()) {
            throw new RuntimeException("Shipper profile already exists for this user");
        }
        
        // Tạo profile shipper mới
        Shipper shipper = new Shipper(userId, vehicleType, licensePlate, deliveryArea);
        return shipperRepository.save(shipper);
    }
    
    // Lấy thông tin shipper theo user ID
    public Optional<Shipper> getShipperByUserId(Integer userId) {
        return shipperRepository.findByUserId(userId);
    }
    
    // Cập nhật trạng thái sẵn sàng
    public Shipper updateAvailability(Integer userId, Boolean isAvailable) {
        Optional<Shipper> shipper = shipperRepository.findByUserId(userId);
        if (shipper.isEmpty()) {
            throw new RuntimeException("Shipper not found");
        }
        
        Shipper shipperEntity = shipper.get();
        shipperEntity.setIsAvailable(isAvailable);
        return shipperRepository.save(shipperEntity);
    }
    
    // Cập nhật rating
    public Shipper updateRating(Integer userId, Integer newRating) {
        Optional<Shipper> shipper = shipperRepository.findByUserId(userId);
        if (shipper.isEmpty()) {
            throw new RuntimeException("Shipper not found");
        }
        
        Shipper shipperEntity = shipper.get();
        shipperEntity.setRating(newRating);
        return shipperRepository.save(shipperEntity);
    }
    
    // Tăng số lượng giao hàng
    public Shipper incrementDeliveries(Integer userId) {
        Optional<Shipper> shipper = shipperRepository.findByUserId(userId);
        if (shipper.isEmpty()) {
            throw new RuntimeException("Shipper not found");
        }
        
        Shipper shipperEntity = shipper.get();
        shipperEntity.setTotalDeliveries(shipperEntity.getTotalDeliveries() + 1);
        return shipperRepository.save(shipperEntity);
    }
    
    // Cập nhật thu nhập
    public Shipper updateEarnings(Integer userId, Double earnings) {
        Optional<Shipper> shipper = shipperRepository.findByUserId(userId);
        if (shipper.isEmpty()) {
            throw new RuntimeException("Shipper not found");
        }
        
        Shipper shipperEntity = shipper.get();
        shipperEntity.setTotalEarnings(shipperEntity.getTotalEarnings() + earnings);
        return shipperRepository.save(shipperEntity);
    }
    
    // Lấy danh sách shipper có sẵn trong khu vực
    public List<Shipper> getAvailableShippersInArea(String area) {
        return shipperRepository.findAvailableShippersInArea(area);
    }
    
    // Lấy top shipper có rating cao
    public List<Shipper> getTopRatedShippers() {
        return shipperRepository.findTopRatedAvailableShippers();
    }
    
    // Lấy thống kê tổng quan
    public ShipperStats getShipperStats() {
        Long totalShippers = shipperRepository.count();
        Long availableShippers = shipperRepository.countByAvailability(true);
        Long busyShippers = shipperRepository.countByAvailability(false);
        
        return new ShipperStats(totalShippers, availableShippers, busyShippers);
    }
    
    // Inner class cho thống kê
    public static class ShipperStats {
        private Long totalShippers;
        private Long availableShippers;
        private Long busyShippers;
        
        public ShipperStats(Long totalShippers, Long availableShippers, Long busyShippers) {
            this.totalShippers = totalShippers;
            this.availableShippers = availableShippers;
            this.busyShippers = busyShippers;
        }
        
        // Getters
        public Long getTotalShippers() { return totalShippers; }
        public Long getAvailableShippers() { return availableShippers; }
        public Long getBusyShippers() { return busyShippers; }
    }
}
