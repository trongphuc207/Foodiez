package com.example.demo.categories;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    @Autowired
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    
    // Lấy tất cả categories
    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc();
    }
    
    // Lấy category theo ID
    public Optional<Category> getCategoryById(Integer id) {
        return categoryRepository.findById(id);
    }
    
    // Lấy category theo tên
    public Optional<Category> getCategoryByName(String name) {
        return categoryRepository.findByNameIgnoreCase(name);
    }
    
    // Tạo category mới
    public Category createCategory(Category category) {
        // Kiểm tra tên category đã tồn tại chưa
        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
            throw new RuntimeException("Category với tên '" + category.getName() + "' đã tồn tại");
        }
        
        return categoryRepository.save(category);
    }
    
    // Cập nhật category
    public Category updateCategory(Integer id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category không tồn tại với ID: " + id));
        
        // Kiểm tra tên mới có trùng với category khác không
        if (!category.getName().equalsIgnoreCase(categoryDetails.getName()) && 
            categoryRepository.existsByNameIgnoreCase(categoryDetails.getName())) {
            throw new RuntimeException("Category với tên '" + categoryDetails.getName() + "' đã tồn tại");
        }
        
        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        
        return categoryRepository.save(category);
    }
    
    // Xóa category
    public void deleteCategory(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category không tồn tại với ID: " + id));
        
        categoryRepository.delete(category);
    }
    
    // Tìm kiếm categories theo keyword
    public List<Category> searchCategories(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllCategories();
        }
        return categoryRepository.searchCategories(keyword.trim());
    }
    
    // Tìm kiếm categories theo tên
    public List<Category> searchCategoriesByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return getAllCategories();
        }
        return categoryRepository.findByNameContainingIgnoreCase(name.trim());
    }
    
    // Tìm kiếm categories theo description
    public List<Category> searchCategoriesByDescription(String description) {
        if (description == null || description.trim().isEmpty()) {
            return getAllCategories();
        }
        return categoryRepository.findByDescriptionContainingIgnoreCase(description.trim());
    }
    
    // Kiểm tra category có tồn tại không
    public boolean categoryExists(Integer id) {
        return categoryRepository.existsById(id);
    }
    
    // Kiểm tra tên category có tồn tại không
    public boolean categoryNameExists(String name) {
        return categoryRepository.existsByNameIgnoreCase(name);
    }
    
    // Đếm số lượng categories
    public long getCategoryCount() {
        return categoryRepository.count();
    }
    
    // Lấy categories mới nhất
    public List<Category> getLatestCategories() {
        return categoryRepository.findAllByOrderByCreatedAtDesc();
    }
    
    // Tạo dữ liệu mẫu
    public String seedData() {
        try {
            // Kiểm tra đã có dữ liệu chưa
            if (categoryRepository.count() > 0) {
                return "Categories đã có dữ liệu, không cần seed";
            }
            
            // Tạo categories mẫu
            Category pho = new Category("Phở", "Vietnamese noodle soup, ready-to-eat");
            Category banhMi = new Category("Bánh Mì", "Vietnamese sandwich, ready-to-eat");
            Category com = new Category("Cơm", "Rice dishes, ready-to-eat");
            Category nuocUong = new Category("Nước uống", "Beverages including coffee, tea, and soft drinks");
            Category pizza = new Category("Pizza", "Món pizza phong cách Ý, nhiều loại topping đa dạng");
            Category bun = new Category("Bún", "Món bún Việt Nam truyền thống, dùng với thịt, chả");
            
            categoryRepository.save(pho);
            categoryRepository.save(banhMi);
            categoryRepository.save(com);
            categoryRepository.save(nuocUong);
            categoryRepository.save(pizza);
            categoryRepository.save(bun);
            
            return "Đã tạo " + categoryRepository.count() + " categories mẫu thành công!";
        } catch (Exception e) {
            return "Lỗi khi tạo dữ liệu mẫu: " + e.getMessage();
        }
    }
}


