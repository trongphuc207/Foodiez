package com.example.demo.products;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    // Get all approved products for customers
    public List<Product> getAllProducts() {
        return repo.findAllApprovedProducts(); // Only show approved products
    }
    
    // Get all products including pending/rejected (for admin/seller)
    public List<Product> getAllProductsForManagement() {
        return repo.findAll();
    }
    
    public List<Product> searchProducts(String keyword) {
        System.out.println("🔍 Searching for keyword: '" + keyword + "'");
        
        // Chỉ search trong sản phẩm đã duyệt
        List<Product> results = repo.searchProducts(keyword);
        
        System.out.println("📦 searchProducts found: " + results.size() + " approved products");
        
        return results;
    }
    
    public List<Product> getProductsByShopId(int shopId) {
        return repo.findByShopId(shopId);
    }
    public Product createProduct(Product product) {
        // Set approval status to 'pending' for new products
        if (product.getApprovalStatus() == null || product.getApprovalStatus().isEmpty()) {
            product.setApprovalStatus("pending");
        }
        return repo.save(product);
    }
    
    public Optional<Product> getProductById(int id) {
        return repo.findById(id);
    }
    
    public Product updateProduct(Product product) {
        return repo.save(product);
    }

    public void deleteProductById(int id) {
        repo.deleteById(id);
    }
    
    public String seedData() {
        try {
            // Kiểm tra xem đã có dữ liệu chưa
            if (repo.count() > 0) {
                return "Dữ liệu đã tồn tại. Có " + repo.count() + " sản phẩm.";
            }
            
            // Tạo dữ liệu mẫu
            Product[] sampleProducts = {
                new Product(1, 1, "Pizza Margherita", "Pizza cổ điển với cà chua, mozzarella và húng quế", 15.99, true, "https://via.placeholder.com/300x200?text=Pizza+Margherita", "active"),
                new Product(1, 1, "Pizza Pepperoni", "Pizza với pepperoni và phô mai", 17.99, true, "https://via.placeholder.com/300x200?text=Pizza+Pepperoni", "active"),
                new Product(2, 2, "Burger Classic", "Burger bò với rau xanh và cà chua", 12.99, true, "https://via.placeholder.com/300x200?text=Burger+Classic", "active"),
                new Product(2, 2, "Chicken Burger", "Burger gà với sốt đặc biệt", 14.99, true, "https://via.placeholder.com/300x200?text=Chicken+Burger", "active"),
                new Product(3, 3, "Caesar Salad", "Salad tươi với gà nướng và sốt Caesar", 9.99, true, "https://via.placeholder.com/300x200?text=Caesar+Salad", "active"),
                new Product(3, 3, "Fresh Salad", "Salad rau tươi với dầu olive", 7.99, true, "https://via.placeholder.com/300x200?text=Fresh+Salad", "active"),
                new Product(4, 4, "Cappuccino", "Cà phê cappuccino thơm ngon", 4.99, true, "https://via.placeholder.com/300x200?text=Cappuccino", "active"),
                new Product(4, 4, "Espresso", "Cà phê espresso đậm đà", 3.99, true, "https://via.placeholder.com/300x200?text=Espresso", "active")
            };
            
            for (Product product : sampleProducts) {
                repo.save(product);
            }
            
            return "Đã tạo " + sampleProducts.length + " sản phẩm mẫu thành công!";
        } catch (Exception e) {
            return "Lỗi khi tạo dữ liệu mẫu: " + e.getMessage();
        }
    }
}
