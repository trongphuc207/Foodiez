package com.example.demo.products;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {
    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }
    public List<Product> searchProducts(String keyword) {
        return repo.findByNameContainingIgnoreCase(keyword);
    }
    public Product createProduct(Product product) {
        return repo.save(product);
    }
}
