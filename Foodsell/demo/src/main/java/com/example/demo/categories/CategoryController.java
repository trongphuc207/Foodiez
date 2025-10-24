package com.example.demo.categories;

import com.example.demo.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {
    
    private final CategoryService categoryService;
    
    @Autowired
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }
    
    // GET: Lấy tất cả categories
    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        try {
            // Mock data với ID cố định để đồng bộ với frontend
            List<Category> categories = new ArrayList<>();
            
            Category pho = new Category("Phở", "Vietnamese noodle soup, ready-to-eat");
            pho.setId(1);
            categories.add(pho);
            
            Category banhMi = new Category("Bánh Mì", "Vietnamese sandwich, ready-to-eat");
            banhMi.setId(2);
            categories.add(banhMi);
            
            Category com = new Category("Cơm", "Rice dishes, ready-to-eat");
            com.setId(3);
            categories.add(com);
            
            Category nuocUong = new Category("Nước uống", "Beverages including coffee, tea, and soft drinks");
            nuocUong.setId(4);
            categories.add(nuocUong);
            
            Category pizza = new Category("Pizza", "Món pizza phong cách Ý, nhiều loại topping đa dạng");
            pizza.setId(5);
            categories.add(pizza);
            
            Category bun = new Category("Bún", "Món bún Việt Nam truyền thống, dùng với thịt, chả");
            bun.setId(6);
            categories.add(bun);
            
            return ResponseEntity.ok(ApiResponse.success(categories, "Lấy danh sách categories thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi lấy danh sách categories: " + e.getMessage()));
        }
    }
    
    // GET: Lấy category theo ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategoryById(@PathVariable Integer id) {
        try {
            Optional<Category> category = categoryService.getCategoryById(id);
            if (category.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(category.get(), "Lấy thông tin category thành công"));
            } else {
                return ResponseEntity.status(404).body(ApiResponse.error("Category không tồn tại"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi lấy thông tin category: " + e.getMessage()));
        }
    }
    
    // GET: Lấy category theo tên
    @GetMapping("/name/{name}")
    public ResponseEntity<ApiResponse<Category>> getCategoryByName(@PathVariable String name) {
        try {
            Optional<Category> category = categoryService.getCategoryByName(name);
            if (category.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(category.get(), "Lấy thông tin category thành công"));
            } else {
                return ResponseEntity.status(404).body(ApiResponse.error("Category không tồn tại"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi lấy thông tin category: " + e.getMessage()));
        }
    }
    
    // POST: Tạo category mới
    @PostMapping
    public ResponseEntity<ApiResponse<Category>> createCategory(@RequestBody Category category) {
        try {
            Category createdCategory = categoryService.createCategory(category);
            return ResponseEntity.ok(ApiResponse.success(createdCategory, "Tạo category thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi tạo category: " + e.getMessage()));
        }
    }
    
    // PUT: Cập nhật category
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(@PathVariable Integer id, @RequestBody Category categoryDetails) {
        try {
            Category updatedCategory = categoryService.updateCategory(id, categoryDetails);
            return ResponseEntity.ok(ApiResponse.success(updatedCategory, "Cập nhật category thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi cập nhật category: " + e.getMessage()));
        }
    }
    
    // DELETE: Xóa category
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable Integer id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(ApiResponse.success("Category đã được xóa", "Xóa category thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi xóa category: " + e.getMessage()));
        }
    }
    
    // GET: Tìm kiếm categories
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Category>>> searchCategories(@RequestParam String keyword) {
        try {
            List<Category> categories = categoryService.searchCategories(keyword);
            return ResponseEntity.ok(ApiResponse.success(categories, "Tìm kiếm categories thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi tìm kiếm categories: " + e.getMessage()));
        }
    }
    
    // GET: Tìm kiếm categories theo tên
    @GetMapping("/search/name")
    public ResponseEntity<ApiResponse<List<Category>>> searchCategoriesByName(@RequestParam String name) {
        try {
            List<Category> categories = categoryService.searchCategoriesByName(name);
            return ResponseEntity.ok(ApiResponse.success(categories, "Tìm kiếm categories theo tên thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi tìm kiếm categories theo tên: " + e.getMessage()));
        }
    }
    
    // GET: Tìm kiếm categories theo description
    @GetMapping("/search/description")
    public ResponseEntity<ApiResponse<List<Category>>> searchCategoriesByDescription(@RequestParam String description) {
        try {
            List<Category> categories = categoryService.searchCategoriesByDescription(description);
            return ResponseEntity.ok(ApiResponse.success(categories, "Tìm kiếm categories theo description thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi tìm kiếm categories theo description: " + e.getMessage()));
        }
    }
    
    // GET: Kiểm tra category có tồn tại không
    @GetMapping("/exists/{id}")
    public ResponseEntity<ApiResponse<Boolean>> categoryExists(@PathVariable Integer id) {
        try {
            boolean exists = categoryService.categoryExists(id);
            return ResponseEntity.ok(ApiResponse.success(exists, "Kiểm tra category thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi kiểm tra category: " + e.getMessage()));
        }
    }
    
    // GET: Kiểm tra tên category có tồn tại không
    @GetMapping("/exists/name/{name}")
    public ResponseEntity<ApiResponse<Boolean>> categoryNameExists(@PathVariable String name) {
        try {
            boolean exists = categoryService.categoryNameExists(name);
            return ResponseEntity.ok(ApiResponse.success(exists, "Kiểm tra tên category thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi kiểm tra tên category: " + e.getMessage()));
        }
    }
    
    // GET: Đếm số lượng categories
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getCategoryCount() {
        try {
            long count = categoryService.getCategoryCount();
            return ResponseEntity.ok(ApiResponse.success(count, "Đếm categories thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi đếm categories: " + e.getMessage()));
        }
    }
    
    // GET: Lấy categories mới nhất
    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<Category>>> getLatestCategories() {
        try {
            List<Category> categories = categoryService.getLatestCategories();
            return ResponseEntity.ok(ApiResponse.success(categories, "Lấy categories mới nhất thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi lấy categories mới nhất: " + e.getMessage()));
        }
    }
    
    // GET: Tạo dữ liệu mẫu
    @GetMapping("/seed")
    public ResponseEntity<ApiResponse<String>> seedData() {
        try {
            String result = "Đã tạo 6 categories mẫu thành công!";
            return ResponseEntity.ok(ApiResponse.success(result, "Tạo dữ liệu mẫu thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Lỗi khi tạo dữ liệu mẫu: " + e.getMessage()));
        }
    }
}
