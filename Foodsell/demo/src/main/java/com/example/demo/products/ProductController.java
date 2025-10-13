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
    
    // GET: Tạo dữ liệu mẫu
    @GetMapping("/seed")
    public String seedData() {
        return service.seedData();
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
