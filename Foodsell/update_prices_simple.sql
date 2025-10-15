-- Script cập nhật giá sản phẩm thành VND - Phiên bản đơn giản
USE food_delivery_db6;
GO

-- 1. Cập nhật giá sản phẩm hiện tại
UPDATE products 
SET price = CASE 
    WHEN name LIKE N'%Pho Bo%' THEN 50000.00
    WHEN name LIKE N'%Pho Ga%' THEN 45000.00  
    WHEN name LIKE N'%Banh Mi%' THEN 30000.00
    WHEN name LIKE N'%Com Ga%' THEN 40000.00
    ELSE price
END,
updated_at = GETDATE();

-- 2. Thêm sản phẩm mới với giá VND đa dạng
-- Phở (15,000 - 65,000 VND)
INSERT INTO products (shop_id, category_id, name, description, price, is_available, image_url, status) VALUES
(1, 1, N'Phở Bò Tái', N'Phở bò với thịt tái tươi', 45000.00, 1, 'pho_bo_tai.jpg', 'active'),
(1, 1, N'Phở Gà Luộc', N'Phở gà với thịt luộc mềm', 40000.00, 1, 'pho_ga_luoc.jpg', 'active'),
(1, 1, N'Phở Chay', N'Phở chay với nấm và rau củ', 25000.00, 1, 'pho_chay.jpg', 'active');

-- Bánh Mì (15,000 - 40,000 VND)
INSERT INTO products (shop_id, category_id, name, description, price, is_available, image_url, status) VALUES
(2, 2, N'Bánh Mì Pate', N'Bánh mì pate truyền thống', 20000.00, 1, 'banh_mi_pate.jpg', 'active'),
(2, 2, N'Bánh Mì Thịt Nướng', N'Bánh mì với thịt nướng', 30000.00, 1, 'banh_mi_thit_nuong.jpg', 'active'),
(2, 2, N'Bánh Mì Đặc Biệt', N'Bánh mì với đầy đủ topping', 35000.00, 1, 'banh_mi_dac_biet.jpg', 'active');

-- Cơm (25,000 - 60,000 VND)
INSERT INTO products (shop_id, category_id, name, description, price, is_available, image_url, status) VALUES
(4, 3, N'Cơm Tấm', N'Cơm tấm với sườn nướng', 35000.00, 1, 'com_tam.jpg', 'active'),
(4, 3, N'Cơm Gà Nướng', N'Cơm gà nướng thơm ngon', 45000.00, 1, 'com_ga_nuong.jpg', 'active'),
(4, 3, N'Cơm Chay', N'Cơm chay với đậu phụ và rau', 25000.00, 1, 'com_chay.jpg', 'active');

-- Nước uống (10,000 - 50,000 VND)
INSERT INTO products (shop_id, category_id, name, description, price, is_available, image_url, status) VALUES
(7, 4, N'Cà Phê Đen', N'Cà phê đen truyền thống', 15000.00, 1, 'ca_phe_den.jpg', 'active'),
(7, 4, N'Cà Phê Sữa', N'Cà phê sữa đá', 20000.00, 1, 'ca_phe_sua.jpg', 'active'),
(7, 4, N'Trà Sữa', N'Trà sữa với trân châu', 30000.00, 1, 'tra_sua.jpg', 'active'),
(7, 4, N'Nước Ép Cam', N'Nước ép cam tươi', 25000.00, 1, 'nuoc_ep_cam.jpg', 'active');

-- Pizza (80,000 - 200,000 VND)
INSERT INTO products (shop_id, category_id, name, description, price, is_available, image_url, status) VALUES
(6, 5, N'Pizza Margherita', N'Pizza Margherita truyền thống', 120000.00, 1, 'pizza_margherita.jpg', 'active'),
(6, 5, N'Pizza Pepperoni', N'Pizza với pepperoni', 150000.00, 1, 'pizza_pepperoni.jpg', 'active'),
(6, 5, N'Pizza Hải Sản', N'Pizza với tôm, mực', 180000.00, 1, 'pizza_hai_san.jpg', 'active');

-- Bún (20,000 - 50,000 VND)
INSERT INTO products (shop_id, category_id, name, description, price, is_available, image_url, status) VALUES
(5, 6, N'Bún Bò Huế', N'Bún bò Huế cay nồng', 40000.00, 1, 'bun_bo_hue.jpg', 'active'),
(5, 6, N'Bún Chả Cá', N'Bún chả cá Đà Nẵng', 35000.00, 1, 'bun_cha_ca.jpg', 'active'),
(5, 6, N'Bún Chay', N'Bún chay với nấm', 25000.00, 1, 'bun_chay.jpg', 'active');

-- 3. Cập nhật giá trong order_items
UPDATE order_items 
SET unit_price = (
    SELECT price 
    FROM products 
    WHERE products.id = order_items.product_id
);

-- 4. Cập nhật tổng tiền trong orders
UPDATE orders 
SET total_amount = (
    SELECT SUM(quantity * unit_price) 
    FROM order_items 
    WHERE order_id = orders.id
);

-- 5. Cập nhật số tiền trong payments
UPDATE payments 
SET amount = (
    SELECT total_amount 
    FROM orders 
    WHERE orders.id = payments.order_id
);

-- 6. Kiểm tra kết quả
PRINT '=== DANH SÁCH SẢN PHẨM THEO GIÁ ===';
SELECT 
    p.id,
    p.name,
    FORMAT(p.price, 'N0') + ' VND' as price_vnd,
    s.name as shop_name,
    c.name as category_name
FROM products p
INNER JOIN shops s ON p.shop_id = s.id
INNER JOIN categories c ON p.category_id = c.id
ORDER BY p.price ASC;

PRINT '=== THỐNG KÊ GIÁ THEO DANH MỤC ===';
SELECT 
    c.name as category_name,
    COUNT(*) as product_count,
    FORMAT(MIN(p.price), 'N0') + ' VND' as min_price,
    FORMAT(MAX(p.price), 'N0') + ' VND' as max_price,
    FORMAT(AVG(p.price), 'N0') + ' VND' as avg_price
FROM products p
INNER JOIN categories c ON p.category_id = c.id
GROUP BY c.name
ORDER BY AVG(p.price) ASC;

PRINT '=== CẬP NHẬT HOÀN TẤT ===';
PRINT 'Tổng số sản phẩm: ' + CAST((SELECT COUNT(*) FROM products) AS VARCHAR);
PRINT 'Giá thấp nhất: ' + FORMAT((SELECT MIN(price) FROM products), 'N0') + ' VND';
PRINT 'Giá cao nhất: ' + FORMAT((SELECT MAX(price) FROM products), 'N0') + ' VND';
