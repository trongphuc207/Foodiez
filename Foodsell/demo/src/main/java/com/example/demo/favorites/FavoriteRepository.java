package com.example.demo.favorites;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Integer> {
    List<Favorite> findByUserId(Integer userId);
    boolean existsByUserIdAndProductId(Integer userId, Integer productId);
    void deleteByUserIdAndProductId(Integer userId, Integer productId);
}
