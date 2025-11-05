package com.example.demo.shops;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class ShopService {
    
    @Autowired
    private ShopRepository shopRepository;
    
    // Lấy tất cả shop
    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }
    
    // Lấy shop theo ID
    public Optional<Shop> getShopById(int id) {
        return shopRepository.findById(id);
    }
    
    // Lấy shop theo seller_id
    public Optional<Shop> getShopBySellerId(int sellerId) {
        return shopRepository.findBySellerId(sellerId);
    }
    
    // Tìm kiếm shop theo keyword
    public List<Shop> searchShops(String keyword) {
        return shopRepository.searchByNameOrAddress(keyword);
    }
    
    // Lấy shop theo rating
    public List<Shop> getShopsByRating(Double minRating) {
        return shopRepository.findByRatingGreaterThanEqual(minRating);
    }
    
    // Lấy shop được sắp xếp theo rating
    public List<Shop> getShopsOrderedByRating() {
        return shopRepository.findAllByOrderByRatingDesc();
    }
    
    // Tạo shop mới
    public Shop createShop(Shop shop) {
        return shopRepository.save(shop);
    }
    
    // Cập nhật shop
    @Transactional
    public Shop updateShop(Shop shop) {
        try {
            // Lấy shop hiện tại từ database
            Shop existingShop = shopRepository.findById(shop.getId())
                .orElseThrow(() -> new RuntimeException("Shop not found with id: " + shop.getId()));
            
            // Chỉ update những field được phép (không update seller_id, created_at)
            if (shop.getName() != null && !shop.getName().trim().isEmpty()) {
                existingShop.setName(shop.getName().trim());
            }
            if (shop.getDescription() != null) {
                existingShop.setDescription(shop.getDescription().trim());
            }
            if (shop.getAddress() != null && !shop.getAddress().trim().isEmpty()) {
                existingShop.setAddress(shop.getAddress().trim());
            }
            if (shop.getOpeningHours() != null) {
                existingShop.setOpeningHours(shop.getOpeningHours().trim());
            }
            if (shop.getRating() != null) {
                existingShop.setRating(shop.getRating());
            }
            
            // Log để debug
            System.out.println("Updating shop with ID: " + existingShop.getId());
            System.out.println("Seller ID (should not change): " + existingShop.getSellerId());
            System.out.println("Name: " + existingShop.getName());
            System.out.println("Address: " + existingShop.getAddress());
            
            return shopRepository.save(existingShop);
        } catch (Exception e) {
            System.err.println("Error updating shop: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to update shop: " + e.getMessage());
        }
    }
    
    // Cập nhật rating cho shop
    public Shop updateShopRating(int id, Integer rating) {
        Shop shop = shopRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Shop not found with id: " + id));
        shop.setRating(rating);
        return shopRepository.save(shop);
    }
    
    // Xóa shop
    public void deleteShop(int id) {
        shopRepository.deleteById(id);
    }
    
    // Đếm số lượng shop
    public long getShopCount() {
        return shopRepository.count();
    }
}
