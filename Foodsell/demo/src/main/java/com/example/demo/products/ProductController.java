package com.example.demo.products;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.demo.config.FileUploadService;
import com.example.demo.dto.ApiResponse;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000") // cho React gọi API
public class ProductController {
    private final ProductService service;
    
    @Autowired
    private FileUploadService fileUploadService;

    public ProductController(ProductService service) {
        this.service = service;
    }

    // GET: Lấy tất cả sản phẩm
    @GetMapping
    public List<Product> getAllProducts() {
        return service.getAllProducts();
    }

    // GET: Lấy sản phẩm theo shop ID
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<ApiResponse<List<Product>>> getProductsByShopId(@PathVariable int shopId) {
        try {
            List<Product> products = service.getProductsByShopId(shopId);
            return ResponseEntity.ok(ApiResponse.success(products, "Lấy sản phẩm theo shop thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi lấy sản phẩm theo shop: " + e.getMessage()));
        }
    }
    
    // GET: Lấy sản phẩm theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProductById(@PathVariable int id) {
        try {
            System.out.println("📤 GET /api/products/" + id + " - Fetching product...");
            Optional<Product> productOpt = service.getProductById(id);
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                System.out.println("✅ Product found: ID=" + product.getId() + ", Name=" + product.getName());
                return ResponseEntity.ok(ApiResponse.success(product, "Lấy sản phẩm thành công"));
            } else {
                System.out.println("❌ Product not found with ID: " + id);
                return ResponseEntity.status(404).body(ApiResponse.error("Không tìm thấy sản phẩm với ID: " + id));
            }
        } catch (Exception e) {
            System.err.println("❌ Error in getProductById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi lấy sản phẩm: " + e.getMessage()));
        }
    }
    
    // GET: Tìm kiếm sản phẩm
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String keyword) {
        return service.searchProducts(keyword);
    }

    // POST: Tạo mới sản phẩm
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return service.createProduct(product);
    }
    
    // PUT: Cập nhật sản phẩm
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(@PathVariable int id, @RequestBody Product product) {
        try {
            Optional<Product> existingProductOpt = service.getProductById(id);
            if (existingProductOpt.isPresent()) {
                Product existingProduct = existingProductOpt.get();
                
                // Cập nhật các trường
                existingProduct.setName(product.getName());
                existingProduct.setDescription(product.getDescription());
                existingProduct.setPrice(product.getPrice());
                existingProduct.setAvailable(product.isAvailable());
                existingProduct.setStatus(product.getStatus());
                existingProduct.setCategoryId(product.getCategoryId());
                
                // Giữ nguyên imageUrl nếu không được cung cấp
                if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                    existingProduct.setImageUrl(product.getImageUrl());
                }
                
                Product updatedProduct = service.updateProduct(existingProduct);
                return ResponseEntity.ok(ApiResponse.success(updatedProduct, "Cập nhật sản phẩm thành công"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi cập nhật sản phẩm: " + e.getMessage()));
        }
    }
    
    // GET: Tạo dữ liệu mẫu
    @GetMapping("/seed")
    public String seedData() {
        return service.seedData();
    }
    
    // GET: Test endpoint
    @GetMapping("/test")
    public String test() {
        return "Products API is working!";
    }
    
    // POST: Upload ảnh cho sản phẩm
    @PostMapping("/{id}/upload-image")
    public ResponseEntity<ApiResponse<Product>> uploadProductImage(
            @PathVariable int id,
            @RequestParam("file") MultipartFile file) {
        try {
            // Upload file and get file path
            String filePath = fileUploadService.uploadProductImage(file);
            
            // Create full URL for the uploaded image
            String fullImageUrl = "http://localhost:8080/" + filePath;
            
            // Update product's image URL
            Optional<Product> productOpt = service.getProductById(id);
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                product.setImageUrl(fullImageUrl);
                Product updatedProduct = service.updateProduct(product);
                
                System.out.println("✅ Product image updated for product ID: " + id + ", Full URL: " + fullImageUrl);
                return ResponseEntity.ok(ApiResponse.success(updatedProduct, "Product image updated successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("❌ Product image upload error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to upload product image: " + e.getMessage()));
        }
    }
    
    // DELETE: Xóa ảnh sản phẩm
    @DeleteMapping("/{id}/remove-image")
    public ResponseEntity<ApiResponse<Product>> removeProductImage(@PathVariable int id) {
        try {
            Optional<Product> productOpt = service.getProductById(id);
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                
                // Delete the image file if it exists
                if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                    String imagePath = product.getImageUrl().replace("http://localhost:8080/", "");
                    fileUploadService.deleteProductImage(imagePath);
                }
                
                // Remove image URL from product
                product.setImageUrl(null);
                Product updatedProduct = service.updateProduct(product);
                
                System.out.println("✅ Product image removed for product ID: " + id);
                return ResponseEntity.ok(ApiResponse.success(updatedProduct, "Product image removed successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("❌ Product image removal error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to remove product image: " + e.getMessage()));
        }
    }
}
