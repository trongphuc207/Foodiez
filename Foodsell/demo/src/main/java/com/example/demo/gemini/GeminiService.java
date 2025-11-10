package com.example.demo.gemini;

import com.example.demo.categories.Category;
import com.example.demo.categories.CategoryService;
import com.example.demo.products.Product;
import com.example.demo.products.ProductService;
import com.example.demo.shops.Shop;
import com.example.demo.shops.ShopService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GeminiService {
    
    @Value("${gemini.api-key}")
    private String apiKey;
    
    @Value("${gemini.model-name:gemini-2.5-flash}")
    private String modelName;
    
    @Value("${gemini.api-base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String apiBaseUrl;
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private ShopService shopService;
    
    @Autowired
    private CategoryService categoryService;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    // Overload method để tương thích với code cũ
    public String chat(String userMessage) {
        return chat(userMessage, null, null);
    }
    
    public String chat(String userMessage, Integer userId) {
        return chat(userMessage, userId, null);
    }
    
    public String chat(String userMessage, Integer userId, String userRole) {
        try {
            // Kiểm tra API key
            if (apiKey == null || apiKey.trim().isEmpty() || apiKey.length() < 20) {
                System.err.println("❌ Invalid API key");
                return "Xin lỗi, API key không hợp lệ. Vui lòng kiểm tra cấu hình.";
            }
            
            // Kiểm tra userMessage
            if (userMessage == null || userMessage.trim().isEmpty()) {
                return "Xin lỗi, câu hỏi không được để trống.";
            }
            
            // Kiểm tra nếu câu hỏi về giá - tìm sản phẩm theo giá
            String lowerMessage = userMessage.toLowerCase();
            
            // Log để debug
            System.out.println("🔍 Checking product creation request...");
            System.out.println("👤 User ID: " + userId);
            System.out.println("📝 Message: " + userMessage);
            System.out.println("📝 Lower message: " + lowerMessage);
            
            // Kiểm tra nếu seller muốn tạo sản phẩm mới
            // Ưu tiên kiểm tra TRƯỚC khi tìm kiếm sản phẩm
            // Kiểm tra pattern: "Tạo món" hoặc "Thêm món" + thông tin sản phẩm
            boolean hasCreateKeyword = lowerMessage.contains("tạo món") || lowerMessage.contains("thêm món") ||
                                      lowerMessage.contains("tạo sản phẩm") || lowerMessage.contains("thêm sản phẩm") ||
                                      lowerMessage.contains("tạo món ăn") || lowerMessage.contains("thêm món ăn");
            
            // Kiểm tra pattern: có từ "tạo" hoặc "thêm" + từ "giá" (ví dụ: "Tạo Pizza, giá 50000")
            boolean hasCreateWithPrice = (lowerMessage.contains("tạo") || lowerMessage.contains("thêm") || 
                                          lowerMessage.contains("đăng") || lowerMessage.contains("post") ||
                                          lowerMessage.contains("add") || lowerMessage.contains("create")) &&
                                          lowerMessage.contains("giá") &&
                                          !lowerMessage.contains("tìm") && 
                                          !lowerMessage.contains("có") &&
                                          !lowerMessage.contains("món nào") &&
                                          !lowerMessage.contains("sản phẩm nào") &&
                                          !lowerMessage.contains("giá bao nhiêu") &&
                                          !lowerMessage.contains("giá là");
            
            System.out.println("🔍 hasCreateKeyword: " + hasCreateKeyword);
            System.out.println("🔍 hasCreateWithPrice: " + hasCreateWithPrice);
            System.out.println("👤 userId: " + userId);
            
            // Kiểm tra nếu seller muốn cập nhật sản phẩm
            boolean hasUpdateKeyword = lowerMessage.contains("cập nhật món") || lowerMessage.contains("sửa món") ||
                                      lowerMessage.contains("update món") || lowerMessage.contains("edit món") ||
                                      lowerMessage.contains("cập nhật sản phẩm") || lowerMessage.contains("sửa sản phẩm") ||
                                      lowerMessage.contains("update sản phẩm") || lowerMessage.contains("edit sản phẩm") ||
                                      (lowerMessage.contains("cập nhật") && lowerMessage.contains("món")) ||
                                      (lowerMessage.contains("sửa") && lowerMessage.contains("món")) ||
                                      (lowerMessage.contains("update") && lowerMessage.contains("món"));
            
            System.out.println("🔍 hasUpdateKeyword: " + hasUpdateKeyword);
            
            // Nếu có pattern cập nhật sản phẩm, ưu tiên xử lý ngay
            if (hasUpdateKeyword) {
                if (userId != null) {
                    // Kiểm tra role - chỉ seller mới được cập nhật sản phẩm
                    if (userRole == null || !userRole.equalsIgnoreCase("seller")) {
                        System.out.println("⚠️ Product update request detected but user is not a seller. Role: " + userRole);
                        return "Xin lỗi, chỉ seller mới có thể cập nhật sản phẩm. Bạn cần đăng nhập với tài khoản seller để sử dụng tính năng này.";
                    }
                    
                    System.out.println("🔄 ✅ Detected product update request from seller ID: " + userId);
                    System.out.println("📝 Message: " + userMessage);
                    try {
                        String result = updateProductFromMessage(userMessage, userId);
                        System.out.println("✅ Product update result: " + (result != null ? result.substring(0, Math.min(100, result.length())) : "null"));
                        return result;
                    } catch (Exception e) {
                        System.err.println("❌ Error updating product: " + e.getMessage());
                        e.printStackTrace();
                        return "Xin lỗi, không thể cập nhật sản phẩm. " + e.getMessage();
                    }
                } else {
                    System.out.println("⚠️ Product update request detected but User ID is null");
                    return "Xin lỗi, bạn cần đăng nhập với tài khoản seller để cập nhật sản phẩm. Vui lòng đăng nhập và thử lại.";
                }
            }
            
            // Nếu có pattern tạo sản phẩm, ưu tiên xử lý ngay
            if (hasCreateKeyword || hasCreateWithPrice) {
                if (userId != null) {
                    // Kiểm tra role - chỉ seller mới được tạo sản phẩm
                    if (userRole == null || !userRole.equalsIgnoreCase("seller")) {
                        System.out.println("⚠️ Product creation request detected but user is not a seller. Role: " + userRole);
                        return "Xin lỗi, chỉ seller mới có thể tạo sản phẩm. Bạn cần đăng nhập với tài khoản seller để sử dụng tính năng này.";
                    }
                    
                    System.out.println("🛍️ ✅ Detected product creation request from seller ID: " + userId);
                    System.out.println("📝 Message: " + userMessage);
                    try {
                        String result = createProductFromMessage(userMessage, userId);
                        System.out.println("✅ Product creation result: " + (result != null ? result.substring(0, Math.min(100, result.length())) : "null"));
                        return result;
                    } catch (Exception e) {
                        System.err.println("❌ Error creating product: " + e.getMessage());
                        e.printStackTrace();
                        return "Xin lỗi, không thể tạo sản phẩm. " + e.getMessage();
                    }
                } else {
                    System.out.println("⚠️ Product creation request detected but User ID is null");
                    return "Xin lỗi, bạn cần đăng nhập với tài khoản seller để tạo sản phẩm. Vui lòng đăng nhập và thử lại.";
                }
            } else {
                System.out.println("ℹ️ Not a product creation request");
            }
            
            // Tìm sản phẩm dưới một mức giá
            if (lowerMessage.contains("dưới") || lowerMessage.contains("ít hơn") || 
                lowerMessage.contains("nhỏ hơn") || lowerMessage.contains("max") || 
                lowerMessage.contains("tối đa") || lowerMessage.contains("món nào")) {
                
                // Extract số tiền từ câu hỏi
                double maxPrice = extractPriceFromMessage(userMessage);
                if (maxPrice > 0) {
                    List<Product> products = productService.getProductsByMaxPrice(maxPrice);
                    
                    // Lọc theo category nếu có yêu cầu
                    products = filterProductsByCategory(products, lowerMessage);
                    
                    if (!products.isEmpty()) {
                        return formatProductListResponse(products, maxPrice, "dưới");
                    } else {
                        return "Xin lỗi, không tìm thấy sản phẩm nào dưới " + String.format("%.0f", maxPrice) + " VNĐ.";
                    }
                }
            }
            
            // Tìm sản phẩm trên một mức giá
            if (lowerMessage.contains("trên") || lowerMessage.contains("lớn hơn") || 
                lowerMessage.contains("nhiều hơn") || lowerMessage.contains("từ") ||
                lowerMessage.contains("ít nhất") || lowerMessage.contains("minimum")) {
                
                // Extract số tiền từ câu hỏi
                double minPrice = extractPriceFromMessage(userMessage);
                if (minPrice > 0) {
                    List<Product> products = productService.getProductsByMinPrice(minPrice);
                    
                    // Lọc theo category nếu có yêu cầu
                    products = filterProductsByCategory(products, lowerMessage);
                    
                    if (!products.isEmpty()) {
                        return formatProductListResponse(products, minPrice, "trên");
                    } else {
                        return "Xin lỗi, không tìm thấy sản phẩm nào trên " + String.format("%.0f", minPrice) + " VNĐ.";
                    }
                }
            }
            
            // Luôn thử tìm kiếm sản phẩm trước (không cần từ khóa tìm kiếm)
            // Ưu tiên tìm kiếm theo tên sản phẩm chính xác trước
            String trimmedMessage = userMessage.trim();
            String trimmedMessageLower = trimmedMessage.toLowerCase();
            
            // Thử tìm kiếm sản phẩm theo từ khóa
            List<Product> searchResults = productService.searchProducts(trimmedMessage);
            if (!searchResults.isEmpty()) {
                System.out.println("🔍 Found " + searchResults.size() + " products matching: " + trimmedMessage);
                
                // Kiểm tra xem có sản phẩm nào match chính xác với message không
                List<Product> exactMatches = new ArrayList<>();
                for (Product product : searchResults) {
                    String productNameLower = product.getName().toLowerCase();
                    // Nếu tên sản phẩm chứa message hoặc message chứa tên sản phẩm (match tốt)
                    if (productNameLower.contains(trimmedMessageLower) || 
                        trimmedMessageLower.contains(productNameLower) ||
                        productNameLower.equals(trimmedMessageLower)) {
                        exactMatches.add(product);
                    }
                }
                
                if (!exactMatches.isEmpty()) {
                    System.out.println("✅ Found " + exactMatches.size() + " exact product matches");
                    return formatProductSearchResponse(exactMatches, trimmedMessage);
                } else {
                    // Nếu không có match chính xác, trả về tất cả kết quả tìm kiếm
                    System.out.println("ℹ️ No exact matches, returning all search results");
                    return formatProductSearchResponse(searchResults, trimmedMessage);
                }
            }
            
            // Nếu không tìm thấy sản phẩm, thử tìm kiếm theo category
            // Chỉ khi message là tên category đơn giản hoặc có từ khóa category
            boolean isCategoryQuery = trimmedMessageLower.contains("nước uống") || 
                                      trimmedMessageLower.contains("đồ uống") ||
                                      trimmedMessageLower.contains("thức uống") ||
                                      trimmedMessageLower.length() < 20; // Message ngắn, có thể là tên category
            
            if (isCategoryQuery) {
                List<Category> categories = categoryService.getAllCategories();
                for (Category category : categories) {
                    String categoryNameLower = category.getName().toLowerCase();
                    // Kiểm tra xem message có chứa tên category không
                    if (trimmedMessageLower.contains(categoryNameLower) ||
                        categoryNameLower.contains(trimmedMessageLower) ||
                        trimmedMessageLower.equals(categoryNameLower)) {
                        System.out.println("🔍 Found category match: " + category.getName());
                        List<Product> categoryProducts = productService.getProductsByCategoryId(category.getId());
                        if (!categoryProducts.isEmpty()) {
                            return formatProductSearchResponse(categoryProducts, "danh mục " + category.getName());
                        }
                    }
                }
            }
            
            // Danh sách các model và API version để thử (ưu tiên v1beta trước)
            String[] modelsToTry = {modelName, "gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"};
            String[] apiVersions = {"https://generativelanguage.googleapis.com/v1beta", 
                                   "https://generativelanguage.googleapis.com/v1", 
                                   apiBaseUrl};
            
            Exception lastException = null;
            
            for (String apiVersion : apiVersions) {
                for (String model : modelsToTry) {
                    try {
                        System.out.println("🔄 Trying: " + model + " on " + apiVersion);
                        String result = tryChatWithModel(userMessage, model, apiVersion);
                        if (result != null && !result.startsWith("Xin lỗi")) {
                            return result;
                        }
                    } catch (HttpClientErrorException e) {
                        lastException = e;
                        String errorBody = e.getResponseBodyAsString();
                        System.err.println("❌ HTTP " + e.getStatusCode() + " with model " + model + " on " + apiVersion);
                        if (errorBody != null && errorBody.length() < 500) {
                            System.err.println("   Error: " + errorBody);
                        }
                        // Nếu là 404, tiếp tục thử model khác
                        if (e.getStatusCode().value() == 404) {
                            continue;
                        }
                        // Nếu là 403 hoặc 401, có thể là API key issue
                        if (e.getStatusCode().value() == 403 || e.getStatusCode().value() == 401) {
                            return "Xin lỗi, API key không có quyền truy cập hoặc không hợp lệ. Vui lòng kiểm tra lại API key.";
                        }
                    } catch (Exception e) {
                        lastException = e;
                        System.err.println("⚠️ Exception with model " + model + " on " + apiVersion + ": " + e.getClass().getName() + " - " + e.getMessage());
                        e.printStackTrace();
                        continue;
                    }
                }
            }
            
            // Nếu tất cả đều fail, trả về thông báo lỗi chi tiết hơn
            if (lastException != null) {
                System.err.println("❌ All models failed. Last error: " + lastException.getClass().getName() + " - " + lastException.getMessage());
                lastException.printStackTrace();
            }
            return "Xin lỗi, không thể kết nối với AI lúc này. " +
                   "Có thể API key chưa được kích hoạt hoặc không có quyền truy cập. " +
                   "Vui lòng kiểm tra API key trong Google Cloud Console và đảm bảo đã bật 'Generative Language API'.";
        } catch (Exception e) {
            System.err.println("❌ Unexpected error in chat method: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            return "Xin lỗi, đã xảy ra lỗi không mong đợi: " + e.getMessage();
        }
    }
    
    private double extractPriceFromMessage(String message) {
        try {
            // Tìm số trong câu hỏi (có thể là 50k, 50000, 50.000, etc.)
            String lowerMessage = message.toLowerCase();
            
            // Pattern: số + k (ví dụ: 50k, 100k)
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d+)\\s*k");
            java.util.regex.Matcher matcher = pattern.matcher(lowerMessage);
            if (matcher.find()) {
                return Double.parseDouble(matcher.group(1)) * 1000;
            }
            
            // Pattern: số thuần (ví dụ: 50000, 50.000)
            pattern = java.util.regex.Pattern.compile("(\\d{1,3}(?:\\.\\d{3})*(?:,\\d+)?)");
            matcher = pattern.matcher(message);
            if (matcher.find()) {
                String numberStr = matcher.group(1).replace(".", "").replace(",", ".");
                return Double.parseDouble(numberStr);
            }
            
            // Pattern: số đơn giản
            pattern = java.util.regex.Pattern.compile("(\\d+)");
            matcher = pattern.matcher(message);
            if (matcher.find()) {
                double value = Double.parseDouble(matcher.group(1));
                // Nếu số nhỏ hơn 1000, có thể là nghìn (ví dụ: 50 = 50k)
                if (value < 1000 && value > 0) {
                    return value * 1000;
                }
                return value;
            }
        } catch (Exception e) {
            System.err.println("Error extracting price: " + e.getMessage());
        }
        return 0;
    }
    
    private String formatProductListResponse(List<Product> products, double price, String type) {
        StringBuilder response = new StringBuilder();
        if ("trên".equals(type)) {
            response.append("Tôi tìm thấy ").append(products.size()).append(" sản phẩm trên ")
                    .append(String.format("%.0f", price)).append(" VNĐ:\n\n");
        } else {
            response.append("Tôi tìm thấy ").append(products.size()).append(" sản phẩm dưới ")
                    .append(String.format("%.0f", price)).append(" VNĐ:\n\n");
        }
        
        // Format đặc biệt để frontend có thể parse và hiển thị danh sách sản phẩm
        response.append("PRODUCT_LIST_START\n");
        
        for (int i = 0; i < Math.min(products.size(), 10); i++) {
            Product product = products.get(i);
            // Lấy thông tin shop
            Optional<Shop> shopOpt = shopService.getShopById(product.getShopId());
            String shopName = shopOpt.map(Shop::getName).orElse("");
            String shopAddress = shopOpt.map(Shop::getAddress).orElse("");
            
            response.append(String.format("PRODUCT|%d|%s|%.0f|%s|%s|%s|%s\n", 
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getDescription() != null && !product.getDescription().isEmpty() 
                    ? (product.getDescription().length() > 100 ? product.getDescription().substring(0, 100) + "..." : product.getDescription())
                    : "",
                product.getImageUrl() != null ? product.getImageUrl() : "",
                shopName,
                shopAddress));
        }
        
        response.append("PRODUCT_LIST_END\n\n");
        
        if (products.size() > 10) {
            response.append(String.format("... và còn %d sản phẩm khác.\n\n", products.size() - 10));
        }
        
        response.append("Bạn có thể click vào sản phẩm để thêm vào giỏ hàng hoặc nói \"Thêm sản phẩm [ID] vào giỏ hàng\".");
        
        return response.toString();
    }
    
    private String formatProductSearchResponse(List<Product> products, String searchQuery) {
        StringBuilder response = new StringBuilder();
        response.append("Tôi tìm thấy ").append(products.size()).append(" sản phẩm phù hợp:\n\n");
        
        // Format đặc biệt để frontend có thể parse và hiển thị danh sách sản phẩm
        response.append("PRODUCT_LIST_START\n");
        
        // Giới hạn hiển thị 10 sản phẩm đầu tiên để tránh quá dài
        int displayCount = Math.min(products.size(), 10);
        for (int i = 0; i < displayCount; i++) {
            Product product = products.get(i);
            // Lấy thông tin shop
            Optional<Shop> shopOpt = shopService.getShopById(product.getShopId());
            String shopName = shopOpt.map(Shop::getName).orElse("");
            String shopAddress = shopOpt.map(Shop::getAddress).orElse("");
            String shopRating = shopOpt.map(shop -> shop.getRating() != null ? String.format("%.1f", shop.getRating().doubleValue()) : "").orElse("");
            
            response.append(String.format("PRODUCT|%d|%s|%.0f|%s|%s|%s|%s|%s\n", 
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getDescription() != null && !product.getDescription().isEmpty() 
                    ? (product.getDescription().length() > 150 ? product.getDescription().substring(0, 150) + "..." : product.getDescription())
                    : "",
                product.getImageUrl() != null ? product.getImageUrl() : "",
                shopName,
                shopAddress,
                shopRating));
        }
        
        response.append("PRODUCT_LIST_END\n\n");
        
        if (products.size() > 10) {
            response.append(String.format("... và còn %d sản phẩm khác.\n\n", products.size() - 10));
        }
        
        response.append("Bạn có thể click vào sản phẩm để thêm vào giỏ hàng.");
        
        return response.toString();
    }
    
    private String formatResponseWithProducts(String aiResponse) {
        try {
            System.out.println("🔍 Parsing AI response for products...");
            
            // Tìm product IDs trong response (ví dụ: "Sản phẩm ID: 20", "ID: 20", "product ID: 20", "Shop ID 6")
            java.util.regex.Pattern idPattern = java.util.regex.Pattern.compile(
                "(?:Sản phẩm\\s+ID|Product\\s+ID|product\\s+id|ID)[:\\s]+(\\d+)", 
                java.util.regex.Pattern.CASE_INSENSITIVE
            );
            java.util.regex.Matcher idMatcher = idPattern.matcher(aiResponse);
            
            Set<Integer> productIds = new HashSet<>();
            while (idMatcher.find()) {
                try {
                    int productId = Integer.parseInt(idMatcher.group(1));
                    // Chỉ lấy ID nếu nó là product ID (không phải Shop ID)
                    // Kiểm tra context xung quanh để xác định
                    int start = Math.max(0, idMatcher.start() - 20);
                    int end = Math.min(aiResponse.length(), idMatcher.end() + 20);
                    String context = aiResponse.substring(start, end).toLowerCase();
                    
                    // Nếu có "shop" gần đó, bỏ qua
                    if (!context.contains("shop") && !context.contains("cửa hàng")) {
                        productIds.add(productId);
                        System.out.println("✅ Found product ID: " + productId);
                    }
                } catch (NumberFormatException e) {
                    // Ignore
                }
            }
            
            // Nếu không tìm thấy ID, thử tìm tên sản phẩm trong response
            if (productIds.isEmpty()) {
                System.out.println("⚠️ No product IDs found, trying to find product names...");
                
                // Tìm các tên sản phẩm được đề cập (thường có dấu ** hoặc bold)
                java.util.regex.Pattern namePattern = java.util.regex.Pattern.compile(
                    "\\*\\*([^*]+?)\\*\\*|\\*([^*]+?)\\*|(?:Tên|Name|Product|món)[:\\s]+([^\\n*]+)"
                );
                java.util.regex.Matcher nameMatcher = namePattern.matcher(aiResponse);
                
                Set<String> productNames = new HashSet<>();
                while (nameMatcher.find()) {
                    String name = nameMatcher.group(1) != null ? nameMatcher.group(1) : 
                                 (nameMatcher.group(2) != null ? nameMatcher.group(2) : 
                                  nameMatcher.group(3));
                    if (name != null && name.trim().length() > 2) {
                        String cleanName = name.trim();
                        // Loại bỏ các từ không cần thiết
                        if (!cleanName.toLowerCase().matches(".*(cửa hàng|shop|địa chỉ|address|mô tả|description|đánh giá|rating).*")) {
                            productNames.add(cleanName);
                            System.out.println("✅ Found product name: " + cleanName);
                        }
                    }
                }
                
                // Tìm kiếm sản phẩm theo tên
                if (!productNames.isEmpty()) {
                    List<Product> allProducts = productService.getAllProducts();
                    for (String name : productNames) {
                        for (Product product : allProducts) {
                            String productName = product.getName().toLowerCase();
                            String searchName = name.toLowerCase();
                            
                            // Tìm kiếm linh hoạt hơn
                            if (productName.contains(searchName) || searchName.contains(productName) ||
                                productName.replaceAll("\\s+", "").contains(searchName.replaceAll("\\s+", ""))) {
                                productIds.add(product.getId());
                                System.out.println("✅ Matched product: " + product.getName() + " (ID: " + product.getId() + ")");
                                break;
                            }
                        }
                    }
                }
            }
            
            // Nếu tìm thấy sản phẩm, format lại response
            if (!productIds.isEmpty()) {
                List<Product> foundProducts = new ArrayList<>();
                for (Integer productId : productIds) {
                    productService.getProductById(productId).ifPresent(foundProducts::add);
                }
                
                if (!foundProducts.isEmpty()) {
                    System.out.println("✅ Found " + foundProducts.size() + " products, formatting response...");
                    
                    // Tạo response mới với format đẹp
                    StringBuilder newResponse = new StringBuilder();
                    
                    // Giữ phần đầu của response (lời chào, giới thiệu) - lấy đến dòng đầu tiên có "Sản phẩm ID" hoặc "**"
                    String[] lines = aiResponse.split("\n");
                    boolean foundProductSection = false;
                    for (int i = 0; i < lines.length; i++) {
                        String line = lines[i];
                        
                        // Tìm dòng bắt đầu phần liệt kê sản phẩm
                        if (line.contains("Sản phẩm ID") || line.contains("Product ID") || 
                            (line.contains("**") && (line.contains("Giá") || line.contains("Price") || 
                             line.matches(".*\\*\\*[^*]+\\*\\*.*")))) {
                            foundProductSection = true;
                            // Giữ dòng đầu tiên nếu nó là lời chào/giới thiệu
                            if (i > 0 && !lines[i-1].trim().isEmpty()) {
                                // Đã thêm dòng trước đó, không cần thêm gì
                            }
                            continue;
                        }
                        
                        // Bỏ qua các dòng trong phần liệt kê sản phẩm cũ
                        if (foundProductSection) {
                            // Bỏ qua các dòng có thông tin sản phẩm
                            if (line.contains("Giá") || line.contains("Price") || 
                                line.contains("Mô tả") || line.contains("Description") ||
                                line.contains("Cửa hàng") || line.contains("Shop") ||
                                line.contains("Địa chỉ") || line.contains("Address") ||
                                line.contains("Đánh giá") || line.contains("Rating") ||
                                line.contains("Shop ID") || line.contains("Sản phẩm ID") ||
                                line.matches(".*\\*\\*.*\\*\\*.*")) {
                                continue;
                            }
                            
                            // Nếu gặp dòng trống và đã có 2 dòng trống liên tiếp, dừng
                            if (line.trim().isEmpty() && i < lines.length - 1 && 
                                lines[i+1].trim().isEmpty()) {
                                break;
                            }
                            
                            // Nếu gặp câu hỏi mới (bắt đầu bằng "Bạn", "Nếu", "Hãy"), dừng
                            if (line.trim().matches("^(Bạn|Nếu|Hãy|Bạn có).*")) {
                                break;
                            }
                        } else {
                            // Giữ phần đầu
                            newResponse.append(line).append("\n");
                        }
                    }
                    
                    // Thêm danh sách sản phẩm format đẹp
                    newResponse.append("\nTôi tìm thấy ").append(foundProducts.size())
                               .append(" sản phẩm phù hợp:\n\n");
                    newResponse.append("PRODUCT_LIST_START\n");
                    
                    for (Product product : foundProducts) {
                        Optional<Shop> shopOpt = shopService.getShopById(product.getShopId());
                        String shopName = shopOpt.map(Shop::getName).orElse("");
                        String shopAddress = shopOpt.map(Shop::getAddress).orElse("");
                        String shopRating = shopOpt.map(shop -> shop.getRating() != null ? 
                            String.format("%.1f", shop.getRating()) : "").orElse("");
                        
                        newResponse.append(String.format("PRODUCT|%d|%s|%.0f|%s|%s|%s|%s|%s\n", 
                            product.getId(),
                            product.getName(),
                            product.getPrice(),
                            product.getDescription() != null && !product.getDescription().isEmpty() 
                                ? (product.getDescription().length() > 150 ? 
                                   product.getDescription().substring(0, 150) + "..." : 
                                   product.getDescription())
                                : "",
                            product.getImageUrl() != null ? product.getImageUrl() : "",
                            shopName,
                            shopAddress,
                            shopRating));
                    }
                    
                    newResponse.append("PRODUCT_LIST_END\n\n");
                    newResponse.append("Bạn có thể click vào sản phẩm để thêm vào giỏ hàng.");
                    
                    return newResponse.toString();
                }
            }
            
            // Nếu không tìm thấy sản phẩm, trả về response gốc
            return aiResponse;
        } catch (Exception e) {
            System.err.println("Error formatting response with products: " + e.getMessage());
            e.printStackTrace();
            return aiResponse; // Trả về response gốc nếu có lỗi
        }
    }
    
    private String tryChatWithModel(String userMessage, String model, String apiBase) {
        try {
            // Lấy thông tin sản phẩm và shop để làm context
            List<Product> products = productService.getAllProducts();
            List<Shop> shops = shopService.getAllShops();
            
            // Tạo context từ dữ liệu sản phẩm và shop
            String context = buildContext(products, shops);
            
            // Tạo prompt với context
            String prompt = context + "\n\nNgười dùng hỏi: " + userMessage + 
                          "\n\nHãy trả lời câu hỏi của người dùng một cách thân thiện và hữu ích. " +
                          "Nếu câu hỏi liên quan đến sản phẩm hoặc shop, hãy sử dụng thông tin từ context ở trên. " +
                          "Nếu người dùng muốn tạo sản phẩm mới (có từ khóa 'tạo', 'thêm', 'đăng' hoặc có pattern tên sản phẩm + giá), " +
                          "hãy hướng dẫn họ sử dụng cú pháp: 'Tạo món [tên], giá [số], mô tả: [mô tả], danh mục: [danh mục]'. " +
                          "Trả lời bằng tiếng Việt.";
            
            // Tạo request body
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            
            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));
            content.put("role", "user");
            
            requestBody.put("contents", List.of(content));
            
            // Tạo headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Tạo URL với API key
            String url = String.format("%s/models/%s:generateContent?key=%s", 
                apiBase, model, apiKey);
            
            System.out.println("🔗 Trying Gemini API URL: " + url.replace(apiKey, "***"));
            System.out.println("🤖 Model: " + model);
            System.out.println("📝 Request body: " + requestBody);
            System.out.println("🔑 API Key length: " + (apiKey != null ? apiKey.length() : 0));
            
            // Gửi request
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            @SuppressWarnings("unchecked")
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, 
                (Class<Map<String, Object>>) (Class<?>) Map.class
            );
            
            System.out.println("✅ Response status: " + response.getStatusCode());
            System.out.println("📦 Response body keys: " + (response.getBody() != null ? response.getBody().keySet() : "null"));
            
            // Parse response
            if (response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                
                // Kiểm tra lỗi từ API
                if (body.containsKey("error")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> error = (Map<String, Object>) body.get("error");
                    String errorMessage = (String) error.getOrDefault("message", "Unknown error");
                    System.err.println("❌ Gemini API Error: " + errorMessage);
                    throw new RuntimeException("API Error: " + errorMessage);
                }
                
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    
                    // Kiểm tra nếu có lỗi trong candidate
                    if (candidate.containsKey("finishReason") && 
                        "SAFETY".equals(candidate.get("finishReason"))) {
                        return "Xin lỗi, câu hỏi của bạn có thể vi phạm chính sách an toàn. Vui lòng thử lại với câu hỏi khác.";
                    }
                    
                    @SuppressWarnings("unchecked")
                    Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
                    if (contentMap != null) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            String text = (String) parts.get(0).get("text");
                            if (text != null && !text.trim().isEmpty()) {
                                System.out.println("✅ Successfully got response from model: " + model);
                                
                                // Parse và format lại response nếu có đề cập đến sản phẩm
                                String formattedResponse = formatResponseWithProducts(text);
                                return formattedResponse;
                            }
                        }
                    }
                }
            }
            
            System.err.println("⚠️ Gemini API: No valid response received");
            throw new RuntimeException("No valid response");
            
        } catch (HttpClientErrorException e) {
            String errorBody = e.getResponseBodyAsString();
            System.err.println("❌ HTTP Error: " + e.getStatusCode());
            System.err.println("❌ Error Response: " + errorBody);
            throw e; // Re-throw để method cha có thể thử model khác
        } catch (Exception e) {
            System.err.println("❌ Exception in tryChatWithModel: " + e.getClass().getName() + " - " + e.getMessage());
            throw e; // Re-throw để method cha có thể thử model khác
        }
    }
    
    private String buildContext(List<Product> products, List<Shop> shops) {
        StringBuilder context = new StringBuilder();
        context.append("Bạn là một chatbot hỗ trợ mua bán sản phẩm trên nền tảng thương mại điện tử. ");
        context.append("Dưới đây là thông tin về các sản phẩm và cửa hàng hiện có:\n\n");
        
        // Thêm thông tin về shops
        if (!shops.isEmpty()) {
            context.append("=== DANH SÁCH CỬA HÀNG ===\n");
            for (Shop shop : shops) {
                context.append(String.format("- Shop ID: %d, Tên: %s, Địa chỉ: %s", 
                    shop.getId(), shop.getName(), shop.getAddress()));
                if (shop.getDescription() != null && !shop.getDescription().isEmpty()) {
                    context.append(", Mô tả: ").append(shop.getDescription());
                }
                if (shop.getRating() != null) {
                    context.append(", Đánh giá: ").append(shop.getRating()).append("/5");
                }
                context.append("\n");
            }
            context.append("\n");
        }
        
        // Thêm thông tin về products (giới hạn 20 sản phẩm đầu tiên để tránh prompt quá dài)
        if (!products.isEmpty()) {
            context.append("=== DANH SÁCH SẢN PHẨM ===\n");
            List<Product> limitedProducts = products.stream().limit(20).collect(Collectors.toList());
            for (Product product : limitedProducts) {
                context.append(String.format("- Sản phẩm ID: %d, Tên: %s, Giá: %.2f VNĐ, Shop ID: %d", 
                    product.getId(), product.getName(), product.getPrice(), product.getShopId()));
                if (product.getDescription() != null && !product.getDescription().isEmpty()) {
                    context.append(", Mô tả: ").append(product.getDescription());
                }
                context.append(", Trạng thái: ").append(product.isAvailable() ? "Có sẵn" : "Hết hàng");
                context.append("\n");
            }
            if (products.size() > 20) {
                context.append(String.format("... và còn %d sản phẩm khác.\n", products.size() - 20));
            }
        }
        
        context.append("\nBạn có thể giúp người dùng:");
        context.append("\n- Tìm kiếm sản phẩm theo tên, mô tả");
        context.append("\n- Tìm kiếm cửa hàng");
        context.append("\n- Tư vấn về sản phẩm");
        context.append("\n- Hướng dẫn cách mua hàng");
        context.append("\n- Trả lời các câu hỏi về giá cả, địa chỉ cửa hàng");
        context.append("\n- Nếu người dùng là seller và muốn tạo sản phẩm mới, hãy hướng dẫn họ sử dụng từ khóa 'tạo món' hoặc 'thêm món' kèm theo thông tin sản phẩm (tên, giá, mô tả, danh mục)");
        
        return context.toString();
    }
    
    /**
     * Tạo sản phẩm mới từ message của seller
     */
    private String createProductFromMessage(String userMessage, Integer userId) {
        try {
            // Lấy shop của seller
            Optional<Shop> shopOpt = shopService.getShopBySellerId(userId);
            if (!shopOpt.isPresent()) {
                return "Xin lỗi, bạn chưa có cửa hàng. Vui lòng tạo cửa hàng trước khi thêm sản phẩm.";
            }
            
            Shop shop = shopOpt.get();
            int shopId = shop.getId();
            
            // Parse thông tin sản phẩm từ message bằng Gemini AI
            Map<String, Object> productInfo = parseProductInfoFromMessage(userMessage);
            
            if (productInfo == null || productInfo.isEmpty()) {
                return "Xin lỗi, tôi không thể hiểu thông tin sản phẩm từ câu mô tả của bạn. " +
                       "Vui lòng cung cấp đầy đủ: tên sản phẩm, giá, mô tả (và danh mục nếu có). " +
                       "Ví dụ: 'Tạo món Cháo ngo, giá 35000, mô tả: Cháo ngo thơm ngon, danh mục: Cơm'";
            }
            
            // Validate thông tin bắt buộc
            String productName = (String) productInfo.get("name");
            Object priceObj = productInfo.get("price");
            String description = (String) productInfo.getOrDefault("description", "");
            
            if (productName == null || productName.trim().isEmpty()) {
                return "Xin lỗi, tôi không tìm thấy tên sản phẩm trong câu mô tả của bạn. " +
                       "Vui lòng cung cấp tên sản phẩm. Ví dụ: 'Tạo món Cháo ngo'";
            }
            
            double price = 0;
            if (priceObj != null) {
                if (priceObj instanceof Number) {
                    price = ((Number) priceObj).doubleValue();
                } else if (priceObj instanceof String) {
                    try {
                        price = Double.parseDouble(((String) priceObj).replaceAll("[^0-9.]", ""));
                    } catch (NumberFormatException e) {
                        // Ignore
                    }
                }
            }
            
            if (price <= 0) {
                return "Xin lỗi, tôi không tìm thấy giá sản phẩm hợp lệ trong câu mô tả của bạn. " +
                       "Vui lòng cung cấp giá. Ví dụ: 'Tạo món Cháo ngo, giá 35000'";
            }
            
            // Tìm category
            int categoryId = 1; // Default category
            String categoryName = (String) productInfo.get("category");
            if (categoryName != null && !categoryName.trim().isEmpty()) {
                Optional<Category> categoryOpt = categoryService.getCategoryByName(categoryName.trim());
                if (categoryOpt.isPresent()) {
                    categoryId = categoryOpt.get().getId();
                } else {
                    // Nếu không tìm thấy category, thử tìm kiếm gần đúng
                    List<Category> categories = categoryService.getAllCategories();
                    for (Category cat : categories) {
                        if (cat.getName().toLowerCase().contains(categoryName.toLowerCase()) ||
                            categoryName.toLowerCase().contains(cat.getName().toLowerCase())) {
                            categoryId = cat.getId();
                            break;
                        }
                    }
                }
            }
            
            // Tạo sản phẩm mới
            Product newProduct = new Product();
            newProduct.setShopId(shopId);
            newProduct.setCategoryId(categoryId);
            newProduct.setName(productName.trim());
            newProduct.setDescription(description != null ? description.trim() : "");
            newProduct.setPrice(price);
            newProduct.setAvailable(true);
            newProduct.setStatus("active");
            
            Product createdProduct = productService.createProduct(newProduct);
            
            return String.format("✅ Đã tạo sản phẩm thành công!\n\n" +
                               "📦 **%s**\n" +
                               "💰 Giá: %.0f VNĐ\n" +
                               "%s" +
                               "🏪 Cửa hàng: %s\n" +
                               "🆔 ID: %d\n\n" +
                               "Bạn có thể cập nhật thông tin hoặc thêm ảnh cho sản phẩm này.",
                               createdProduct.getName(),
                               createdProduct.getPrice(),
                               description != null && !description.trim().isEmpty() 
                                   ? "📝 Mô tả: " + description.trim() + "\n" 
                                   : "",
                               shop.getName(),
                               createdProduct.getId());
            
        } catch (Exception e) {
            System.err.println("❌ Error in createProductFromMessage: " + e.getMessage());
            e.printStackTrace();
            return "Xin lỗi, đã xảy ra lỗi khi tạo sản phẩm: " + e.getMessage();
        }
    }
    
    /**
     * Parse thông tin sản phẩm từ message bằng Gemini AI
     */
    private Map<String, Object> parseProductInfoFromMessage(String userMessage) {
        try {
            // Lấy danh sách categories để cung cấp context cho AI
            List<Category> categories = categoryService.getAllCategories();
            StringBuilder categoriesList = new StringBuilder();
            for (Category cat : categories) {
                categoriesList.append("- ").append(cat.getName()).append("\n");
            }
            
            // Tạo prompt cho Gemini AI
            String prompt = String.format(
                "Bạn là một AI hỗ trợ parse thông tin sản phẩm từ câu mô tả của người dùng. " +
                "Hãy trích xuất thông tin sau từ câu mô tả và trả về dưới dạng JSON:\n" +
                "{\n" +
                "  \"id\": số ID sản phẩm (nếu có, ví dụ: 25),\n" +
                "  \"name\": \"Tên sản phẩm\",\n" +
                "  \"price\": số giá (chỉ số, không có ký tự), ví dụ: 35000,\n" +
                "  \"description\": \"Mô tả sản phẩm (nếu có)\",\n" +
                "  \"category\": \"Tên danh mục (nếu có, chọn từ danh sách dưới)\"\n" +
                "}\n\n" +
                "Danh sách danh mục có sẵn:\n%s\n\n" +
                "Câu mô tả của người dùng: \"%s\"\n\n" +
                "Hãy trả về CHỈ JSON, không có text thêm. Nếu không tìm thấy thông tin nào, để null hoặc \"\". " +
                "Ví dụ: {\"id\": 25, \"name\": \"Cháo ngo\", \"price\": 35000, \"description\": \"Cháo ngo thơm ngon\", \"category\": \"Cơm\"}",
                categoriesList.toString(),
                userMessage
            );
            
            // Gọi Gemini AI
            String response = tryChatWithModel(prompt, modelName, apiBaseUrl);
            
            if (response == null || response.startsWith("Xin lỗi")) {
                System.err.println("❌ Failed to get response from Gemini AI");
                return null;
            }
            
            // Parse JSON response
            // Loại bỏ markdown code blocks nếu có
            response = response.trim();
            if (response.startsWith("```json")) {
                response = response.substring(7);
            }
            if (response.startsWith("```")) {
                response = response.substring(3);
            }
            if (response.endsWith("```")) {
                response = response.substring(0, response.length() - 3);
            }
            response = response.trim();
            
            // Parse JSON manually (đơn giản hóa)
            Map<String, Object> result = new HashMap<>();
            
            // Extract id
            int idStart = response.indexOf("\"id\"");
            if (idStart > 0) {
                int colonIndex = response.indexOf(":", idStart);
                int valueStart = colonIndex + 1;
                // Tìm số hoặc null
                while (valueStart < response.length() && 
                       (response.charAt(valueStart) == ' ' || response.charAt(valueStart) == '\t')) {
                    valueStart++;
                }
                int valueEnd = valueStart;
                while (valueEnd < response.length() && 
                       (Character.isDigit(response.charAt(valueEnd)))) {
                    valueEnd++;
                }
                if (valueEnd > valueStart) {
                    try {
                        int id = Integer.parseInt(response.substring(valueStart, valueEnd));
                        result.put("id", id);
                    } catch (NumberFormatException e) {
                        // Ignore
                    }
                }
            }
            
            // Extract name
            int nameStart = response.indexOf("\"name\"");
            if (nameStart > 0) {
                int colonIndex = response.indexOf(":", nameStart);
                int quoteStart = response.indexOf("\"", colonIndex) + 1;
                int quoteEnd = response.indexOf("\"", quoteStart);
                if (quoteEnd > quoteStart) {
                    result.put("name", response.substring(quoteStart, quoteEnd));
                }
            }
            
            // Extract price
            int priceStart = response.indexOf("\"price\"");
            if (priceStart > 0) {
                int colonIndex = response.indexOf(":", priceStart);
                int valueStart = colonIndex + 1;
                // Tìm số hoặc null
                while (valueStart < response.length() && 
                       (response.charAt(valueStart) == ' ' || response.charAt(valueStart) == '\t')) {
                    valueStart++;
                }
                int valueEnd = valueStart;
                while (valueEnd < response.length() && 
                       (Character.isDigit(response.charAt(valueEnd)) || response.charAt(valueEnd) == '.')) {
                    valueEnd++;
                }
                if (valueEnd > valueStart) {
                    try {
                        double price = Double.parseDouble(response.substring(valueStart, valueEnd));
                        result.put("price", price);
                    } catch (NumberFormatException e) {
                        // Ignore
                    }
                }
            }
            
            // Extract description
            int descStart = response.indexOf("\"description\"");
            if (descStart > 0) {
                int colonIndex = response.indexOf(":", descStart);
                int quoteStart = response.indexOf("\"", colonIndex) + 1;
                int quoteEnd = response.indexOf("\"", quoteStart);
                if (quoteEnd > quoteStart) {
                    result.put("description", response.substring(quoteStart, quoteEnd));
                }
            }
            
            // Extract category
            int catStart = response.indexOf("\"category\"");
            if (catStart > 0) {
                int colonIndex = response.indexOf(":", catStart);
                int quoteStart = response.indexOf("\"", colonIndex) + 1;
                int quoteEnd = response.indexOf("\"", quoteStart);
                if (quoteEnd > quoteStart) {
                    result.put("category", response.substring(quoteStart, quoteEnd));
                }
            }
            
            System.out.println("✅ Parsed product info: " + result);
            return result;
            
        } catch (Exception e) {
            System.err.println("❌ Error parsing product info: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * Cập nhật sản phẩm từ message của seller
     */
    private String updateProductFromMessage(String userMessage, Integer userId) {
        try {
            // Lấy shop của seller
            Optional<Shop> shopOpt = shopService.getShopBySellerId(userId);
            if (!shopOpt.isPresent()) {
                return "Xin lỗi, bạn chưa có cửa hàng. Vui lòng tạo cửa hàng trước khi cập nhật sản phẩm.";
            }
            
            Shop shop = shopOpt.get();
            int shopId = shop.getId();
            
            // Parse thông tin sản phẩm cần cập nhật từ message bằng Gemini AI
            Map<String, Object> productInfo = parseProductInfoFromMessage(userMessage);
            
            if (productInfo == null || productInfo.isEmpty()) {
                return "Xin lỗi, tôi không thể hiểu thông tin sản phẩm từ câu mô tả của bạn. " +
                       "Vui lòng cung cấp: ID hoặc tên sản phẩm, và các thông tin cần cập nhật (tên, giá, mô tả, danh mục). " +
                       "Ví dụ: 'Cập nhật món ID 25, giá 40000' hoặc 'Sửa món Pizza Phô Mai, giá 55000'";
            }
            
            // Tìm sản phẩm theo ID hoặc tên
            Product productToUpdate = null;
            
            // Thử tìm theo ID trước
            Object productIdObj = productInfo.get("id");
            if (productIdObj != null) {
                try {
                    int productId;
                    if (productIdObj instanceof Number) {
                        productId = ((Number) productIdObj).intValue();
                    } else {
                        productId = Integer.parseInt(productIdObj.toString().replaceAll("[^0-9]", ""));
                    }
                    Optional<Product> productOpt = productService.getProductById(productId);
                    if (productOpt.isPresent()) {
                        productToUpdate = productOpt.get();
                    }
                } catch (NumberFormatException e) {
                    // Ignore
                }
            }
            
            // Nếu không tìm thấy theo ID, thử tìm theo tên
            if (productToUpdate == null) {
                String productName = (String) productInfo.get("name");
                if (productName != null && !productName.trim().isEmpty()) {
                    // Tìm sản phẩm trong shop của seller
                    List<Product> shopProducts = productService.getProductsByShopId(shopId);
                    for (Product product : shopProducts) {
                        if (product.getName().toLowerCase().contains(productName.toLowerCase()) ||
                            productName.toLowerCase().contains(product.getName().toLowerCase())) {
                            productToUpdate = product;
                            break;
                        }
                    }
                }
            }
            
            if (productToUpdate == null) {
                return "Xin lỗi, không tìm thấy sản phẩm cần cập nhật. " +
                       "Vui lòng cung cấp ID hoặc tên sản phẩm chính xác. " +
                       "Ví dụ: 'Cập nhật món ID 25, giá 40000' hoặc 'Sửa món Pizza Phô Mai, giá 55000'";
            }
            
            // Kiểm tra xem sản phẩm có thuộc shop của seller không
            if (productToUpdate.getShopId() != shopId) {
                return "Xin lỗi, bạn không có quyền cập nhật sản phẩm này. Sản phẩm không thuộc cửa hàng của bạn.";
            }
            
            // Cập nhật thông tin sản phẩm
            boolean hasUpdate = false;
            
            // Cập nhật tên
            String newName = (String) productInfo.get("name");
            if (newName != null && !newName.trim().isEmpty() && !newName.equalsIgnoreCase(productToUpdate.getName())) {
                productToUpdate.setName(newName.trim());
                hasUpdate = true;
            }
            
            // Cập nhật giá
            Object priceObj = productInfo.get("price");
            if (priceObj != null) {
                double newPrice = 0;
                if (priceObj instanceof Number) {
                    newPrice = ((Number) priceObj).doubleValue();
                } else if (priceObj instanceof String) {
                    try {
                        newPrice = Double.parseDouble(((String) priceObj).replaceAll("[^0-9.]", ""));
                    } catch (NumberFormatException e) {
                        // Ignore
                    }
                }
                if (newPrice > 0 && newPrice != productToUpdate.getPrice()) {
                    productToUpdate.setPrice(newPrice);
                    hasUpdate = true;
                }
            }
            
            // Cập nhật mô tả
            String newDescription = (String) productInfo.get("description");
            if (newDescription != null && !newDescription.trim().isEmpty()) {
                productToUpdate.setDescription(newDescription.trim());
                hasUpdate = true;
            }
            
            // Cập nhật danh mục
            String categoryName = (String) productInfo.get("category");
            if (categoryName != null && !categoryName.trim().isEmpty()) {
                Optional<Category> categoryOpt = categoryService.getCategoryByName(categoryName.trim());
                if (categoryOpt.isPresent()) {
                    int newCategoryId = categoryOpt.get().getId();
                    if (newCategoryId != productToUpdate.getCategoryId()) {
                        productToUpdate.setCategoryId(newCategoryId);
                        hasUpdate = true;
                    }
                } else {
                    // Nếu không tìm thấy category, thử tìm kiếm gần đúng
                    List<Category> categories = categoryService.getAllCategories();
                    for (Category cat : categories) {
                        if (cat.getName().toLowerCase().contains(categoryName.toLowerCase()) ||
                            categoryName.toLowerCase().contains(cat.getName().toLowerCase())) {
                            if (cat.getId() != productToUpdate.getCategoryId()) {
                                productToUpdate.setCategoryId(cat.getId());
                                hasUpdate = true;
                            }
                            break;
                        }
                    }
                }
            }
            
            if (!hasUpdate) {
                return "Xin lỗi, không có thông tin nào được cập nhật. " +
                       "Vui lòng cung cấp thông tin cần cập nhật (tên, giá, mô tả, danh mục). " +
                       "Ví dụ: 'Cập nhật món ID 25, giá 40000, mô tả: Mô tả mới'";
            }
            
            // Lưu sản phẩm đã cập nhật
            Product updatedProduct = productService.updateProduct(productToUpdate);
            
            return String.format("✅ Đã cập nhật sản phẩm thành công!\n\n" +
                               "📦 **%s**\n" +
                               "💰 Giá: %.0f VNĐ\n" +
                               "%s" +
                               "🏪 Cửa hàng: %s\n" +
                               "🆔 ID: %d\n\n" +
                               "Sản phẩm đã được cập nhật thành công.",
                               updatedProduct.getName(),
                               updatedProduct.getPrice(),
                               updatedProduct.getDescription() != null && !updatedProduct.getDescription().trim().isEmpty() 
                                   ? "📝 Mô tả: " + updatedProduct.getDescription().trim() + "\n" 
                                   : "",
                               shop.getName(),
                               updatedProduct.getId());
            
        } catch (Exception e) {
            System.err.println("❌ Error in updateProductFromMessage: " + e.getMessage());
            e.printStackTrace();
            return "Xin lỗi, đã xảy ra lỗi khi cập nhật sản phẩm: " + e.getMessage();
        }
    }
    
    /**
     * Lọc sản phẩm theo category dựa trên message
     */
    private List<Product> filterProductsByCategory(List<Product> products, String lowerMessage) {
        // Kiểm tra xem có yêu cầu lọc theo category không
        boolean isFoodOnly = lowerMessage.contains("món ăn") || 
                           lowerMessage.contains("đồ ăn") ||
                           lowerMessage.contains("thức ăn");
        
        boolean isDrinkOnly = lowerMessage.contains("nước uống") || 
                             lowerMessage.contains("đồ uống") ||
                             lowerMessage.contains("thức uống") ||
                             lowerMessage.contains("món nước") ||
                             (lowerMessage.contains("nước") && 
                              !lowerMessage.contains("nước mắm") && 
                              !lowerMessage.contains("nước chấm") &&
                              !lowerMessage.contains("nước sốt"));
        
        System.out.println("🔍 Category filter check - isFoodOnly: " + isFoodOnly + ", isDrinkOnly: " + isDrinkOnly);
        System.out.println("🔍 Message: " + lowerMessage);
        
        if (!isFoodOnly && !isDrinkOnly) {
            // Không có yêu cầu lọc, trả về tất cả
            System.out.println("ℹ️ No category filter applied");
            return products;
        }
        
        // Lấy category "Nước uống" để lọc
        Optional<Category> drinkCategoryOpt = categoryService.getCategoryByName("Nước uống");
        int drinkCategoryId = -1;
        if (drinkCategoryOpt.isPresent()) {
            drinkCategoryId = drinkCategoryOpt.get().getId();
            System.out.println("✅ Found drink category ID: " + drinkCategoryId);
        } else {
            System.out.println("⚠️ Drink category 'Nước uống' not found");
        }
        
        List<Product> filteredProducts = new ArrayList<>();
        for (Product product : products) {
            if (isFoodOnly) {
                // Chỉ lấy món ăn (không phải nước uống)
                if (drinkCategoryId > 0 && product.getCategoryId() != drinkCategoryId) {
                    filteredProducts.add(product);
                } else if (drinkCategoryId <= 0) {
                    // Nếu không tìm thấy category "Nước uống", trả về tất cả
                    filteredProducts.add(product);
                }
            } else if (isDrinkOnly) {
                // Chỉ lấy nước uống
                if (drinkCategoryId > 0 && product.getCategoryId() == drinkCategoryId) {
                    filteredProducts.add(product);
                }
            }
        }
        
        System.out.println("🔍 Filtered products: " + filteredProducts.size() + " from " + products.size() + 
                          " (isFoodOnly: " + isFoodOnly + ", isDrinkOnly: " + isDrinkOnly + ", drinkCategoryId: " + drinkCategoryId + ")");
        
        return filteredProducts;
    }
}

