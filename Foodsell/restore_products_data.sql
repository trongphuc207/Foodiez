-- Script khôi phục dữ liệu sản phẩm
USE food_delivery_db6;
GO

-- Categories đã có sẵn trong database, không cần tạo lại
-- Kiểm tra categories hiện có
SELECT 'Categories hiện có:' as info;
SELECT id, name, description FROM categories ORDER BY id;

-- Tạo users trước (cần thiết cho foreign key seller_id trong shops)
INSERT INTO users (email, password_hash, full_name, role, is_verified, created_at, updated_at) VALUES
('seller1@email.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Nguyễn Văn A', 'SELLER', 1, GETDATE(), GETDATE()),
('seller2@email.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Trần Thị B', 'SELLER', 1, GETDATE(), GETDATE()),
('seller3@email.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Lê Văn C', 'SELLER', 1, GETDATE(), GETDATE()),
('seller4@email.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Phạm Thị D', 'SELLER', 1, GETDATE(), GETDATE()),
('seller5@email.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Hoàng Văn E', 'SELLER', 1, GETDATE(), GETDATE()),
('seller6@email.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Vũ Thị F', 'SELLER', 1, GETDATE(), GETDATE()),
('seller7@email.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Đặng Văn G', 'SELLER', 1, GETDATE(), GETDATE());

-- Tạo shops (sử dụng đúng ID của users đã tạo)
INSERT INTO shops (seller_id, name, description, address, opening_hours, rating, created_at) VALUES
(18, N'Phở Delicious', N'Phở truyền thống Hà Nội', N'123 Đường Láng, Hà Nội', N'6:00-22:00', 4.5, GETDATE()),
(19, N'Bánh Mì King', N'Bánh mì ngon nhất thành phố', N'456 Nguyễn Huệ, TP.HCM', N'6:30-21:30', 4.3, GETDATE()),
(20, N'Mì Quảng 123', N'Mì Quảng đặc sản Quảng Nam', N'789 Lê Lợi, Đà Nẵng', N'7:00-22:00', 4.7, GETDATE()),
(21, N'Cơm Gà Bà Buội', N'Cơm gà Hội An nổi tiếng', N'321 Trần Hưng Đạo, Hội An', N'6:00-21:00', 4.6, GETDATE()),
(22, N'Bún Chả Cá 109', N'Bún chả cá đặc sản Nha Trang', N'654 Lê Thánh Tôn, Nha Trang', N'6:30-21:30', 4.4, GETDATE()),
(23, N'Pizza Zone', N'Pizza Ý chính hiệu', N'987 Nguyễn Văn Linh, TP.HCM', N'10:00-23:00', 4.2, GETDATE()),
(24, N'Coffee & Chill', N'Cà phê và đồ uống', N'147 Lý Tự Trọng, TP.HCM', N'6:00-23:00', 4.8, GETDATE());

-- Tạo products (sử dụng đúng shop_id từ 10-16)
INSERT INTO products (shop_id, category_id, name, description, price, is_available, image_url, status, created_at, updated_at) VALUES
-- Pho Delicious (shop_id = 10)
(10, 1, N'Phở Bò', N'Phở bò truyền thống Hà Nội', 50000.00, 1, 'pho_bo.jpg', 'active', GETDATE(), GETDATE()),
(10, 1, N'Phở Gà', N'Phở gà thơm ngon', 45000.00, 1, 'pho_ga.jpg', 'active', GETDATE(), GETDATE()),
(10, 1, N'Phở Bò Đặc Biệt', N'Phở bò với thịt bò tái, gầu, gân, bắp bò', 65000.00, 1, 'pho_bo_dac_biet.jpg', 'active', GETDATE(), GETDATE()),
(10, 1, N'Phở Gà Truyền Thống', N'Phở gà với thịt gà luộc, da giòn', 55000.00, 1, 'pho_ga_truyen_thong.jpg', 'active', GETDATE(), GETDATE()),
(10, 1, N'Phở Chay', N'Phở chay với nấm, đậu phụ, rau củ', 35000.00, 1, 'pho_chay.jpg', 'active', GETDATE(), GETDATE()),

-- Banh Mi King (shop_id = 11)  
(11, 2, N'Bánh Mì Thịt', N'Bánh mì với thịt nướng, pate, rau thơm', 30000.00, 1, 'banh_mi_thit.jpg', 'active', GETDATE(), GETDATE()),
(11, 2, N'Bánh Mì Thịt Nướng', N'Bánh mì với thịt nướng, pate, rau thơm', 25000.00, 1, 'banh_mi_thit_nuong.jpg', 'active', GETDATE(), GETDATE()),
(11, 2, N'Bánh Mì Chả Cá', N'Bánh mì với chả cá, dưa leo, rau', 30000.00, 1, 'banh_mi_cha_ca.jpg', 'active', GETDATE(), GETDATE()),
(11, 2, N'Bánh Mì Pate', N'Bánh mì pate truyền thống', 20000.00, 1, 'banh_mi_pate.jpg', 'active', GETDATE(), GETDATE()),
(11, 2, N'Bánh Mì Đặc Biệt', N'Bánh mì với đầy đủ thịt, chả, pate', 35000.00, 1, 'banh_mi_dac_biet.jpg', 'active', GETDATE(), GETDATE()),

-- Mì Quảng 123 (shop_id = 12)
(12, 6, N'Mì Quảng Tôm Thịt', N'Mì Quảng với tôm và thịt heo', 45000.00, 1, 'mi_quang_tom_thit.jpg', 'active', GETDATE(), GETDATE()),
(12, 6, N'Mì Quảng Gà', N'Mì Quảng với thịt gà', 40000.00, 1, 'mi_quang_ga.jpg', 'active', GETDATE(), GETDATE()),
(12, 6, N'Mì Quảng Chay', N'Mì Quảng chay với nấm, đậu phụ', 30000.00, 1, 'mi_quang_chay.jpg', 'active', GETDATE(), GETDATE()),

-- Cơm Gà Bà Buội (shop_id = 13)
(13, 3, N'Cơm Gà', N'Cơm gà Hội An truyền thống', 40000.00, 1, 'com_ga.jpg', 'active', GETDATE(), GETDATE()),
(13, 3, N'Cơm Gà Hội An', N'Cơm gà Hội An truyền thống', 50000.00, 1, 'com_ga_hoi_an.jpg', 'active', GETDATE(), GETDATE()),
(13, 3, N'Cơm Gà Nướng', N'Cơm gà nướng với gia vị đặc biệt', 55000.00, 1, 'com_ga_nuong.jpg', 'active', GETDATE(), GETDATE()),
(13, 3, N'Cơm Gà Xối Mỡ', N'Cơm gà xối mỡ thơm ngon', 45000.00, 1, 'com_ga_xoi_mo.jpg', 'active', GETDATE(), GETDATE()),

-- Bún Chả Cá 109 (shop_id = 14)
(14, 6, N'Bún Chả Cá Đặc Biệt', N'Bún chả cá với chả cá tươi', 40000.00, 1, 'bun_cha_ca_dac_biet.jpg', 'active', GETDATE(), GETDATE()),
(14, 6, N'Bún Chả Cá Thường', N'Bún chả cá truyền thống', 35000.00, 1, 'bun_cha_ca_thuong.jpg', 'active', GETDATE(), GETDATE()),
(14, 6, N'Bún Chả Cá Chay', N'Bún chả cá chay với nấm', 28000.00, 1, 'bun_cha_ca_chay.jpg', 'active', GETDATE(), GETDATE()),

-- Pizza Zone (shop_id = 15)
(15, 5, N'Pizza Margherita', N'Pizza Margherita truyền thống Ý', 120000.00, 1, 'pizza_margherita.jpg', 'active', GETDATE(), GETDATE()),
(15, 5, N'Pizza Pepperoni', N'Pizza với pepperoni và phô mai', 150000.00, 1, 'pizza_pepperoni.jpg', 'active', GETDATE(), GETDATE()),
(15, 5, N'Pizza Hải Sản', N'Pizza với tôm, mực, cá', 180000.00, 1, 'pizza_hai_san.jpg', 'active', GETDATE(), GETDATE()),
(15, 5, N'Pizza 4 Mùa', N'Pizza với 4 loại topping khác nhau', 200000.00, 1, 'pizza_4_mua.jpg', 'active', GETDATE(), GETDATE()),

-- Coffee & Chill (shop_id = 16)
(16, 4, N'Cà Phê Đen', N'Cà phê đen truyền thống', 15000.00, 1, 'ca_phe_den.jpg', 'active', GETDATE(), GETDATE()),
(16, 4, N'Cà Phê Sữa', N'Cà phê sữa đá', 20000.00, 1, 'ca_phe_sua.jpg', 'active', GETDATE(), GETDATE()),
(16, 4, N'Trà Sữa Trân Châu', N'Trà sữa với trân châu đen', 35000.00, 1, 'tra_sua_tran_chau.jpg', 'active', GETDATE(), GETDATE()),
(16, 4, N'Nước Ép Cam', N'Nước ép cam tươi', 25000.00, 1, 'nuoc_ep_cam.jpg', 'active', GETDATE(), GETDATE()),
(16, 4, N'Sinh Tố Bơ', N'Sinh tố bơ thơm ngon', 30000.00, 1, 'sinh_to_bo.jpg', 'active', GETDATE(), GETDATE());

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
ORDER BY p.id;

-- Thống kê
SELECT 
    'Categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 
    'Shops' as table_name, COUNT(*) as count FROM shops
UNION ALL
SELECT 
    'Products' as table_name, COUNT(*) as count FROM products;
