CREATE DATABASE food_delivery_db6;
GO 
USE food_delivery_db6;
GO
-- 1.1 Users
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20),
    address NVARCHAR(MAX),
    role NVARCHAR(20) NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin', 'shipper')),
    is_verified BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    deleted_at DATETIME2 NULL
);
GO
-- Trigger update
CREATE TRIGGER trg_users_update
ON users
AFTER UPDATE
AS
BEGIN
    UPDATE users
    SET updated_at = GETDATE()
    FROM users u
    INNER JOIN inserted i ON u.id = i.id;
END;
Go
-- 1.2 Delivery Addresses
CREATE TABLE delivery_addresses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    address_name NVARCHAR(100) NOT NULL,
    full_address NVARCHAR(MAX) NOT NULL,
    phone NVARCHAR(20),
    is_default BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION
);

-- 1.3 Categories
CREATE TABLE categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- 1.4 Shops
CREATE TABLE shops (
    id INT IDENTITY(1,1) PRIMARY KEY,
    seller_id INT NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    address NVARCHAR(MAX) NOT NULL,
    opening_hours NVARCHAR(255),
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2.1 Products
CREATE TABLE products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    shop_id INT NOT NULL,
    category_id INT NOT NULL,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(10,2) NOT NULL,
   is_available BIT DEFAULT 1,
    image_url NVARCHAR(500),
    status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE NO ACTION
);
GO
-- Trigger update
CREATE TRIGGER trg_products_update
ON products
AFTER UPDATE
AS
BEGIN
    UPDATE products
    SET updated_at = GETDATE()
    FROM products p
    INNER JOIN inserted i ON p.id = i.id;
END;
Go
-- 3.1 Vouchers
CREATE TABLE vouchers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(50) UNIQUE NOT NULL,
    discount_type NVARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(5,2) NOT NULL,
    min_order_value DECIMAL(10,2),
    expiry_date DATE NOT NULL,
    max_uses INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    created_by INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE NO ACTION
);

-- 4.1 Orders
CREATE TABLE orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    buyer_id INT NOT NULL,
    shop_id INT NOT NULL,
    delivery_address_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'shipping', 'delivered', 'cancelled')),
    voucher_id INT NULL,
    notes NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE NO ACTION,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (delivery_address_id) REFERENCES delivery_addresses(id) ON DELETE NO ACTION,
    FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE SET NULL
);

ALTER TABLE orders ADD
    recipient_name NVARCHAR(100) NULL,
    recipient_phone NVARCHAR(20) NULL,
    address_text NVARCHAR(MAX) NULL,
    latitude DECIMAL(9,6) NULL,
    longitude DECIMAL(9,6) NULL;

-- 4.2 Order Items
CREATE TABLE order_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE NO ACTION
);

-- 5.1 Payment Methods
CREATE TABLE payment_methods (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE()
);

-- 5.2 Payments
CREATE TABLE payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    payment_method_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    transaction_id NVARCHAR(255),
    payment_date DATETIME2 NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE NO ACTION
);

-- 6.1 Deliveries
CREATE TABLE deliveries (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    shipper_id INT NULL,
    status NVARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'picked_up', 'in_transit', 'delivered', 'failed')),
    tracking_code NVARCHAR(100),
    delivered_at DATETIME2 NULL,
    failure_reason NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE NO ACTION,
    FOREIGN KEY (shipper_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 6.2 Delivery Zones
CREATE TABLE delivery_zones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    shop_id INT NOT NULL,
    zone_name NVARCHAR(100) NOT NULL,
    delivery_fee DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(10,2) DEFAULT 0,
    estimated_time INT NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- 7.1 Reviews
CREATE TABLE reviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NULL,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(MAX),
    image_url NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE NO ACTION,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION
);

-- 7.2 Shop Reviews
CREATE TABLE shop_reviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NULL,
    shop_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE NO ACTION,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION
);

-- 8.1 Notifications
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    type NVARCHAR(20) NOT NULL CHECK (type IN ('order_update', 'promotion', 'admin_message')),
    title NVARCHAR(255),
    message NVARCHAR(MAX) NOT NULL,
    is_read BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE NO ACTION
);

CREATE TABLE chats (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NULL,
    is_bot BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE NO ACTION,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE NO ACTION
);


-- 9.2 Messages
CREATE TABLE messages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    chat_id INT NOT NULL,
    sender_id INT NULL,
    message NVARCHAR(MAX) NOT NULL,
    is_bot BIT DEFAULT 0,
    timestamp DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 10.1 Order Status History
CREATE TABLE order_status_history (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    status NVARCHAR(20) NOT NULL,
    notes NVARCHAR(MAX),
    changed_by INT,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE NO ACTION
);
SET IDENTITY_INSERT users ON;
INSERT INTO users (id, email, password_hash, full_name, phone, address, role, is_verified) VALUES (1, 'admin@example.com', 'hashedpass', 'Admin User', '0500034420', '123 Hanoi St, Hanoi', 'admin', 1);
INSERT INTO users (id, email, password_hash, full_name, phone, address, role, is_verified) VALUES (2, 'seller1@example.com', 'hashedpass', 'Seller One', '0405451545', '456 Saigon Ave, Ho Chi Minh City', 'seller', 1);
INSERT INTO users (id, email, password_hash, full_name, phone, address, role, is_verified) VALUES (3, 'seller2@example.com', 'hashedpass', 'Seller Two', '0875227972', '456 Saigon Ave, Ho Chi Minh City', 'seller', 1);
INSERT INTO users (id, email, password_hash, full_name, phone, address, role, is_verified) VALUES (4, 'buyer1@example.com', 'hashedpass', 'Buyer One', '0465432660', '123 Hanoi St, Hanoi', 'buyer', 1);
INSERT INTO users (id, email, password_hash, full_name, phone, address, role, is_verified) VALUES (5, 'buyer2@example.com', 'hashedpass', 'Buyer Two', '0619812714', '123 Hanoi St, Hanoi', 'buyer', 1);
INSERT INTO users (id, email, password_hash, full_name, phone, address, role, is_verified) VALUES (6, 'shipper1@example.com', 'hashedpass', 'Shipper One', '0390633094', '789 Da Nang Blvd, Da Nang', 'shipper', 1);
SET IDENTITY_INSERT users OFF;
GO

-- Insert into delivery_addresses
SET IDENTITY_INSERT delivery_addresses ON;
INSERT INTO delivery_addresses (id, user_id, address_name, full_address, phone, is_default) VALUES (1, 4, 'Home', '123 Buyer St, Hanoi', '0490659980', 1);
INSERT INTO delivery_addresses (id, user_id, address_name, full_address, phone, is_default) VALUES (2, 5, 'Office', '456 Buyer Ave, Saigon', '0492142740', 1);
SET IDENTITY_INSERT delivery_addresses OFF;
GO

-- Insert into categories
SET IDENTITY_INSERT categories ON;
INSERT INTO categories (id, name, description) VALUES (1, 'Pho', 'Vietnamese noodle soup, ready-to-eat');
INSERT INTO categories (id, name, description) VALUES (2, 'Banh Mi', 'Vietnamese sandwich, ready-to-eat');
INSERT INTO categories (id, name, description) VALUES (3, 'Com', 'Rice dishes, ready-to-eat');
SET IDENTITY_INSERT categories OFF;
GO

-- Insert into shops
SET IDENTITY_INSERT shops ON;
INSERT INTO shops (id, seller_id, name, description, address, opening_hours, rating) VALUES (1, 2, 'Pho Delicious', 'Best ready-to-eat Pho in town, delivered hot', '100 Pho St, Hanoi', '8AM-10PM', 4.5);
INSERT INTO shops (id, seller_id, name, description, address, opening_hours, rating) VALUES (2, 3, 'Banh Mi King', 'Fresh ready-to-eat Banh Mi daily, fast delivery', '200 Banh Mi Ave, Saigon', '7AM-9PM', 4.8);
SET IDENTITY_INSERT shops OFF;
GO

-- Insert into products
SET IDENTITY_INSERT products ON;
INSERT INTO products (id, shop_id, category_id, name, description, price, is_available, image_url, status) VALUES (1, 1, 1, 'Pho Bo', 'Ready-to-eat Beef Pho, hot and fresh', 5.0, 1, 'pho_bo.jpg', 'active');
INSERT INTO products (id, shop_id, category_id, name, description, price, is_available, image_url, status) VALUES (2, 1, 1, 'Pho Ga', 'Ready-to-eat Chicken Pho, delivered warm', 4.5, 1, 'pho_ga.jpg', 'active');
INSERT INTO products (id, shop_id, category_id, name, description, price, is_available, image_url, status) VALUES (3, 2, 2, 'Banh Mi Thit', 'Ready-to-eat Meat Banh Mi', 3.0, 1, 'banh_mi.jpg', 'active');
INSERT INTO products (id, shop_id, category_id, name, description, price, is_available, image_url, status) VALUES (4, 2, 3, 'Com Ga', 'Ready-to-eat Chicken Rice', 4.0, 1, 'com_ga.jpg', 'active');
SET IDENTITY_INSERT products OFF;
GO

-- Insert into vouchers (adjusted for user-specific like, created by admin, random codes, percentage, max_uses=1 for single use)
SET IDENTITY_INSERT vouchers ON;
INSERT INTO vouchers (id, code, discount_type, discount_value, min_order_value, expiry_date, max_uses, used_count, created_by) VALUES (1, '1223ABD', 'percentage', 10.0, 20.0, '2025-12-31', 1, 0, 1); -- For buyer1
INSERT INTO vouchers (id, code, discount_type, discount_value, min_order_value, expiry_date, max_uses, used_count, created_by) VALUES (2, '4567EFG', 'percentage', 15.0, 15.0, '2025-12-31', 1, 0, 1); -- For buyer2
INSERT INTO vouchers (id, code, discount_type, discount_value, min_order_value, expiry_date, max_uses, used_count, created_by) VALUES (3, '89HIJK0', 'percentage', 5.0, 10.0, '2025-12-31', 1, 0, 1); -- Additional
SET IDENTITY_INSERT vouchers OFF;
GO

-- Insert into orders (link vouchers to orders for buyers)
SET IDENTITY_INSERT orders ON;
INSERT INTO orders (id, buyer_id, shop_id, delivery_address_id, total_amount, status, voucher_id, notes, recipient_name, recipient_phone, address_text, latitude, longitude) VALUES (1, 4, 1, 1, 10.0, 'pending', 1, 'Extra spicy', 'Buyer One', '0127363062', '123 Buyer St, Hanoi', 21.0285, 105.8542);
INSERT INTO orders (id, buyer_id, shop_id, delivery_address_id, total_amount, status, voucher_id, notes, recipient_name, recipient_phone, address_text, latitude, longitude) VALUES (2, 5, 2, 2, 7.0, 'confirmed', 2, NULL, 'Buyer Two', '0150651604', '456 Buyer Ave, Saigon', 10.8231, 106.6297);
SET IDENTITY_INSERT orders OFF;
GO

-- Insert into order_items
SET IDENTITY_INSERT order_items ON;
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (1, 1, 1, 2, 5.0);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (2, 2, 3, 1, 3.0);
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price) VALUES (3, 2, 4, 1, 4.0);
SET IDENTITY_INSERT order_items OFF;
GO

-- Insert into payment_methods
SET IDENTITY_INSERT payment_methods ON;
INSERT INTO payment_methods (id, name, description, is_active) VALUES (1, 'Cash on Delivery', 'Pay when delivered', 1);
INSERT INTO payment_methods (id, name, description, is_active) VALUES (2, 'Credit Card', 'Pay with card', 1);
SET IDENTITY_INSERT payment_methods OFF;
GO

-- Insert into payments
SET IDENTITY_INSERT payments ON;
INSERT INTO payments (id, order_id, payment_method_id, amount, status, transaction_id, payment_date) VALUES (1, 1, 1, 10.0, 'pending', NULL, NULL);
INSERT INTO payments (id, order_id, payment_method_id, amount, status, transaction_id, payment_date) VALUES (2, 2, 2, 7.0, 'completed', 'TX123', '2025-09-29');
SET IDENTITY_INSERT payments OFF;
GO

-- Insert into deliveries
SET IDENTITY_INSERT deliveries ON;
INSERT INTO deliveries (id, order_id, shipper_id, status, tracking_code, delivered_at, failure_reason) VALUES (1, 1, 6, 'assigned', 'TRACK001', NULL, NULL);
INSERT INTO deliveries (id, order_id, shipper_id, status, tracking_code, delivered_at, failure_reason) VALUES (2, 2, 6, 'in_transit', 'TRACK002', NULL, NULL);
SET IDENTITY_INSERT deliveries OFF;
GO

-- Insert into delivery_zones
SET IDENTITY_INSERT delivery_zones ON;
INSERT INTO delivery_zones (id, shop_id, zone_name, delivery_fee, min_order_value, estimated_time, is_active) VALUES (1, 1, 'Hanoi Center', 2.0, 5.0, 30, 1);
INSERT INTO delivery_zones (id, shop_id, zone_name, delivery_fee, min_order_value, estimated_time, is_active) VALUES (2, 2, 'Saigon Center', 1.5, 0.0, 20, 1);
SET IDENTITY_INSERT delivery_zones OFF;
GO

-- Insert into reviews
SET IDENTITY_INSERT reviews ON;
INSERT INTO reviews (id, order_id, product_id, user_id, rating, comment, image_url) VALUES (1, 1, 1, 4, 5, 'Delicious ready-to-eat Pho!', NULL);
SET IDENTITY_INSERT reviews OFF;
GO

-- Insert into shop_reviews
SET IDENTITY_INSERT shop_reviews ON;
INSERT INTO shop_reviews (id, order_id, shop_id, user_id, rating, comment) VALUES (1, 1, 1, 4, 4, 'Good service and fast delivery');
SET IDENTITY_INSERT shop_reviews OFF;
GO

-- Insert into notifications
SET IDENTITY_INSERT notifications ON;
INSERT INTO notifications (id, user_id, type, title, message, is_read) VALUES (1, 4, 'order_update', 'Order Pending', 'Your order is pending', 0);
INSERT INTO notifications (id, user_id, type, title, message, is_read) VALUES (2, 4, 'promotion', 'New Voucher', 'You have a new voucher: 1223ABD', 0);
INSERT INTO notifications (id, user_id, type, title, message, is_read) VALUES (3, 5, 'promotion', 'New Voucher', 'You have a new voucher: 4567EFG', 0);
SET IDENTITY_INSERT notifications OFF;
GO

-- Insert into chats
SET IDENTITY_INSERT chats ON;
INSERT INTO chats (id, order_id, buyer_id, seller_id, is_bot) VALUES (1, 1, 4, 2, 0);
SET IDENTITY_INSERT chats OFF;
GO

-- Insert into messages
SET IDENTITY_INSERT messages ON;
INSERT INTO messages (id, chat_id, sender_id, message, is_bot) VALUES (1, 1, 4, 'When will my order be ready?', 0);
INSERT INTO messages (id, chat_id, sender_id, message, is_bot) VALUES (2, 1, 2, 'In 30 minutes.', 0);
SET IDENTITY_INSERT messages OFF;
GO

-- Insert into order_status_history
SET IDENTITY_INSERT order_status_history ON;
INSERT INTO order_status_history (id, order_id, status, notes, changed_by) VALUES (1, 1, 'pending', NULL, 4);
SET IDENTITY_INSERT order_status_history OFF;
GO


SELECT N'Trà Đào Cam Sả' AS test1, N'Cà Phê Sữa Đá' AS test2;
SELECT id,
       sys.fn_varbintohexstr(CAST(description AS VARBINARY(MAX))) AS hex
FROM dbo.products
WHERE id IN (7,8,9,30,31);
-- Nếu thấy nhiều '003F' → mô tả đang là '?' thật ⇒ cần ghi đè lại
