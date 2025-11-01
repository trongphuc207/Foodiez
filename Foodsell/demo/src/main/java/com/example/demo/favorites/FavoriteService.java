package com.example.demo.favorites;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import com.example.demo.products.ProductRepository;
import com.example.demo.products.Product;
import com.example.demo.shops.Shop;
import com.example.demo.shops.ShopRepository;

@Service
@Transactional
public class FavoriteService {
    @Autowired
    private FavoriteRepository repo;
    
    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private ShopRepository shopRepo;

    public List<FavoriteProductDTO> getFavoritesForUser(Integer userId) {
        return repo.findByUserId(userId).stream()
            .map(favorite -> {
                Product product = productRepo.findById(favorite.getProductId()).orElse(null);
                if (product != null) {
                    Shop shop = shopRepo.findById(product.getShopId()).orElse(null);
                    String shopName = shop != null ? shop.getName() : "Unknown Shop";
                    
                    return new FavoriteProductDTO(
                        product.getId(),
                        product.getName(),
                        product.getDescription(),
                        product.getPrice(),
                        product.getImageUrl(),
                        shopName,
                        product.isAvailable()
                    );
                }
                return null;
            })
            .filter(dto -> dto != null)
            .collect(Collectors.toList());
    }

    public boolean addFavorite(Integer userId, Integer productId) {
        if (repo.existsByUserIdAndProductId(userId, productId)) return false;
        Favorite f = new Favorite(userId, productId);
        repo.save(f);
        return true;
    }

    @Transactional
    public boolean removeFavorite(Integer userId, Integer productId) {
        if (!repo.existsByUserIdAndProductId(userId, productId)) return false;
        repo.deleteByUserIdAndProductId(userId, productId);
        repo.flush(); // Ensure the delete is executed immediately
        return true;
    }
}
