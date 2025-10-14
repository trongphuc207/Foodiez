package com.example.demo.shops;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
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
    public Shop updateShop(Shop shop) {
        return shopRepository.save(shop);
    }
    
    // Cập nhật rating cho shop
    public Shop updateShopRating(int id, Double rating) {
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
