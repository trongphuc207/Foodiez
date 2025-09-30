package com.example.demo.products;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000") // cho React gọi API
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    // GET: Lấy tất cả sản phẩm
    @GetMapping
    public List<Product> getAllProducts() {
        return service.getAllProducts();
    }
@GetMapping("/search")
public List<Product> searchProducts(@RequestParam String keyword) {
    return service.searchProducts(keyword);
}

    // POST: Tạo mới sản phẩm
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return service.createProduct(product);
    }
}
