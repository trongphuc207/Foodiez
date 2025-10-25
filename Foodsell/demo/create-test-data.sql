-- Script tạo user test cho Cart API testing
-- Chạy script này trong H2 Console hoặc database

-- Xóa user cũ nếu có
DELETE FROM users WHERE email = 'customer@test.com';

-- Tạo user mới
INSERT INTO users (email, password_hash, full_name, role, is_verified, created_at, updated_at) 
VALUES (
    'customer@test.com',
    '$2a$10$nUrIigFjFdbvt37Gox9Pa.hwd82jgfGj1Zvgmq6rM2d29pGiCPY3.', -- password123
    'Test Customer',
    'customer',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Tạo sản phẩm test
INSERT INTO products (name, price, description, image_url, is_available, created_at, updated_at)
VALUES (
    'Pizza Margherita',
    150000.0,
    'Pizza cổ điển với cà chua và mozzarella',
    'pizza-margherita.jpg',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

INSERT INTO products (name, price, description, image_url, is_available, created_at, updated_at)
VALUES (
    'Burger Bò',
    120000.0,
    'Burger bò thơm ngon',
    'burger-bo.jpg',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Kiểm tra dữ liệu
SELECT 'Users:' as info;
SELECT id, email, full_name, role, is_verified FROM users WHERE email = 'customer@test.com';

SELECT 'Products:' as info;
SELECT id, name, price, is_available FROM products WHERE name IN ('Pizza Margherita', 'Burger Bò');
