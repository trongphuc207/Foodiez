-- Cập nhật giá sản phẩm thành giá VND chính xác
USE food_delivery_db6;
GO

-- Cập nhật giá cho các sản phẩm hiện tại
UPDATE products 
SET price = CASE 
    WHEN id = 1 THEN 50000.00  -- Pho Bo: 50,000 VND
    WHEN id = 2 THEN 45000.00  -- Pho Ga: 45,000 VND  
    WHEN id = 3 THEN 30000.00  -- Banh Mi Thit: 30,000 VND
    WHEN id = 4 THEN 40000.00  -- Com Ga: 40,000 VND
    ELSE price
END,
updated_at = GETDATE()
WHERE id IN (1, 2, 3, 4);

-- Thêm các sản phẩm mới với giá VND đa dạng
INSERT INTO products (shop_id, category_id, name, description, price, is_available, image_url, status) VALUES
-- Pho Delicious (shop_id = 1)
(1, 1, N'Phở Bò Đặc Biệt', N'Phở bò với thịt bò tái, gầu, gân, bắp bò', 65000.00, 1, 'pho_bo_dac_biet.jpg', 'active'),
(1, 1, N'Phở Gà Truyền Thống', N'Phở gà với thịt gà luộc, da giòn', 55000.00, 1, 'pho_ga_truyen_thong.jpg', 'active'),
(1, 1, N'Phở Chay', N'Phở chay với nấm, đậu phụ, rau củ', 35000.00, 1, 'pho_chay.jpg', 'active'),

-- Banh Mi King (shop_id = 2)  
(2, 2, N'Bánh Mì Thịt Nướng', N'Bánh mì với thịt nướng, pate, rau thơm', 25000.00, 1, 'banh_mi_thit_nuong.jpg', 'active'),
(2, 2, N'Bánh Mì Chả Cá', N'Bánh mì với chả cá, dưa leo, rau', 30000.00, 1, 'banh_mi_cha_ca.jpg', 'active'),
(2, 2, N'Bánh Mì Pate', N'Bánh mì pate truyền thống', 20000.00, 1, 'banh_mi_pate.jpg', 'active'),
(2, 2, N'Bánh Mì Đặc Biệt', N'Bánh mì với đầy đủ thịt, chả, pate', 35000.00, 1, 'banh_mi_dac_biet.jpg', 'active'),

-- Mì Quảng 123 (shop_id = 3)
(3, 6, N'Mì Quảng Tôm Thịt', N'Mì Quảng với tôm và thịt heo', 45000.00, 1, 'mi_quang_tom_thit.jpg', 'active'),
(3, 6, N'Mì Quảng Gà', N'Mì Quảng với thịt gà', 40000.00, 1, 'mi_quang_ga.jpg', 'active'),
(3, 6, N'Mì Quảng Chay', N'Mì Quảng chay với nấm, đậu phụ', 30000.00, 1, 'mi_quang_chay.jpg', 'active'),

-- Cơm Gà Bà Buội (shop_id = 4)
(4, 3, N'Cơm Gà Hội An', N'Cơm gà Hội An truyền thống', 50000.00, 1, 'com_ga_hoi_an.jpg', 'active'),
(4, 3, N'Cơm Gà Nướng', N'Cơm gà nướng với gia vị đặc biệt', 55000.00, 1, 'com_ga_nuong.jpg', 'active'),
(4, 3, N'Cơm Gà Xối Mỡ', N'Cơm gà xối mỡ thơm ngon', 45000.00, 1, 'com_ga_xoi_mo.jpg', 'active'),

-- Bún Chả Cá 109 (shop_id = 5)
(5, 6, N'Bún Chả Cá Đặc Biệt', N'Bún chả cá với chả cá tươi', 40000.00, 1, 'bun_cha_ca_dac_biet.jpg', 'active'),
(5, 6, N'Bún Chả Cá Thường', N'Bún chả cá truyền thống', 35000.00, 1, 'bun_cha_ca_thuong.jpg', 'active'),
(5, 6, N'Bún Chả Cá Chay', N'Bún chả cá chay với nấm', 28000.00, 1, 'bun_cha_ca_chay.jpg', 'active'),

-- Pizza Zone (shop_id = 6)
(6, 5, N'Pizza Margherita', N'Pizza Margherita truyền thống Ý', 120000.00, 1, 'pizza_margherita.jpg', 'active'),
(6, 5, N'Pizza Pepperoni', N'Pizza với pepperoni và phô mai', 150000.00, 1, 'pizza_pepperoni.jpg', 'active'),
(6, 5, N'Pizza Hải Sản', N'Pizza với tôm, mực, cá', 180000.00, 1, 'pizza_hai_san.jpg', 'active'),
(6, 5, N'Pizza 4 Mùa', N'Pizza với 4 loại topping khác nhau', 200000.00, 1, 'pizza_4_mua.jpg', 'active'),

-- Coffee & Chill (shop_id = 7)
(7, 4, N'Cà Phê Đen', N'Cà phê đen truyền thống', 15000.00, 1, 'ca_phe_den.jpg', 'active'),
(7, 4, N'Cà Phê Sữa', N'Cà phê sữa đá', 20000.00, 1, 'ca_phe_sua.jpg', 'active'),
(7, 4, N'Trà Sữa Trân Châu', N'Trà sữa với trân châu đen', 35000.00, 1, 'tra_sua_tran_chau.jpg', 'active'),
(7, 4, N'Nước Ép Cam', N'Nước ép cam tươi', 25000.00, 1, 'nuoc_ep_cam.jpg', 'active'),
(7, 4, N'Sinh Tố Bơ', N'Sinh tố bơ thơm ngon', 30000.00, 1, 'sinh_to_bo.jpg', 'active');

-- Cập nhật giá trong bảng order_items để phù hợp với giá mới
UPDATE order_items 
SET unit_price = CASE 
    WHEN product_id = 1 THEN 50000.00  -- Pho Bo
    WHEN product_id = 2 THEN 45000.00  -- Pho Ga  
    WHEN product_id = 3 THEN 30000.00  -- Banh Mi Thit
    WHEN product_id = 4 THEN 40000.00  -- Com Ga
    ELSE unit_price
END
WHERE product_id IN (1, 2, 3, 4);

-- Cập nhật tổng tiền trong orders
UPDATE orders 
SET total_amount = (
    SELECT SUM(quantity * unit_price) 
    FROM order_items 
    WHERE order_id = orders.id
)
WHERE id IN (1, 2);

-- Cập nhật số tiền trong payments
UPDATE payments 
SET amount = (
    SELECT total_amount 
    FROM orders 
    WHERE orders.id = payments.order_id
)
WHERE order_id IN (1, 2);

-- Kiểm tra kết quả
SELECT 
    p.id,
    p.name,
    p.price,
    s.name as shop_name,
    c.name as category_name
FROM products p
INNER JOIN shops s ON p.shop_id = s.id
INNER JOIN categories c ON p.category_id = c.id
ORDER BY p.price ASC;

-- Thống kê giá theo danh mục
SELECT 
    c.name as category_name,
    COUNT(*) as product_count,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price,
    AVG(p.price) as avg_price
FROM products p
INNER JOIN categories c ON p.category_id = c.id
GROUP BY c.name
ORDER BY avg_price ASC;
