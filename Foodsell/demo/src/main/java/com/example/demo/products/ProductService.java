package com.example.demo.products;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ProductService {
    private final ProductRepository repo;
    private final Map<Integer, ProductBasicDTO> productBasicInfoCache = new ConcurrentHashMap<>();

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public ProductBasicDTO getProductBasicInfo(Integer productId) {
        // Try cache first
        ProductBasicDTO cached = productBasicInfoCache.get(productId);
        if (cached != null) {
            return cached;
        }

        // Cache miss - load from DB
        Optional<Product> product = repo.findById(productId);
        if (product.isPresent()) {
            ProductBasicDTO basicInfo = ProductBasicDTO.fromProduct(product.get());
            productBasicInfoCache.put(productId, basicInfo);
            return basicInfo;
        }
        return null;
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }
    public List<Product> searchProducts(String keyword) {
        System.out.println("🔍 Searching for keyword: '" + keyword + "'");
        
        // Thử cả 2 cách search
        List<Product> results1 = repo.findByNameContainingIgnoreCase(keyword);
        List<Product> results2 = repo.searchProducts(keyword);
        
        System.out.println("📦 findByNameContainingIgnoreCase found: " + results1.size() + " products");
        System.out.println("📦 searchProducts found: " + results2.size() + " products");
        
        // Trả về kết quả từ method nào có kết quả
        return results1.size() > 0 ? results1 : results2;
    }
    
    public List<Product> getProductsByShopId(int shopId) {
        return repo.findByShopId(shopId);
    }
    public Product createProduct(Product product) {
        return repo.save(product);
    }
    
    public Optional<Product> getProductById(int id) {
        return repo.findById(id);
    }
    
    public Product updateProduct(Product product) {
        return repo.save(product);
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
