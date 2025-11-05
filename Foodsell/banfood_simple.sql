-- Script đơn giản để setup database tương thích Hibernate
USE [food_delivery_db6]
GO

-- 1. Xóa database cũ nếu có
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'food_delivery_db6')
BEGIN
    ALTER DATABASE [food_delivery_db6] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [food_delivery_db6];
END
GO

-- 2. Tạo database mới
CREATE DATABASE [food_delivery_db6]
GO

USE [food_delivery_db6]
GO

-- 3. Tạo các bảng cơ bản trước
CREATE TABLE [dbo].[users](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [email] [nvarchar](255) NOT NULL,
    [password_hash] [nvarchar](255) NOT NULL,
    [full_name] [nvarchar](255) NOT NULL,
    [phone] [varchar](255) NULL,
    [address] [varchar](255) NULL,
    [role] [nvarchar](20) NOT NULL,
    [is_verified] [bit] NULL,
    [created_at] [datetime2](7) NULL,
    [updated_at] [datetime2](7) NULL,
    [deleted_at] [datetime2](7) NULL,
    [reset_token] [varchar](255) NULL,
    [reset_token_expiry] [datetime2](6) NULL,
    [profile_image] [varchar](255) NULL,
    [verification_token] [varchar](255) NULL,
    [verification_token_expiry] [datetime2](6) NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

CREATE TABLE [dbo].[categories](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [name] [nvarchar](100) NOT NULL,
    [description] [nvarchar](max) NULL,
    [created_at] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

CREATE TABLE [dbo].[shops](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [seller_id] [int] NOT NULL,
    [name] [nvarchar](255) NOT NULL,
    [description] [nvarchar](max) NULL,
    [address] [nvarchar](max) NOT NULL,
    [opening_hours] [nvarchar](255) NULL,
    [rating] [int] NULL DEFAULT 0,
    [created_at] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

CREATE TABLE [dbo].[products](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [shop_id] [int] NOT NULL,
    [category_id] [int] NOT NULL,
    [name] [nvarchar](255) NOT NULL,
    [description] [varchar](255) NULL,
    [price] [float] NULL,
    [is_available] [bit] NULL,
    [image_url] [varchar](255) NULL,
    [status] [nvarchar](20) NULL,
    [created_at] [datetime2](7) NULL,
    [updated_at] [datetime2](7) NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

CREATE TABLE [dbo].[orders](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [buyer_id] [int] NOT NULL,
    [shop_id] [int] NOT NULL,
    [delivery_address_id] [int] NOT NULL,
    [total_amount] [decimal](10, 2) NOT NULL,
    [status] [nvarchar](20) NULL,
    [voucher_id] [int] NULL,
    [notes] [nvarchar](max) NULL,
    [created_at] [datetime2](7) NULL,
    [recipient_name] [nvarchar](100) NULL,
    [recipient_phone] [nvarchar](20) NULL,
    [address_text] [nvarchar](max) NULL,
    [latitude] [decimal](9, 6) NULL,
    [longitude] [decimal](9, 6) NULL,
    PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

-- 4. Tạo bảng reviews tương thích Hibernate
CREATE TABLE [dbo].[reviews](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [customer_id] [int] NOT NULL,
    [product_id] [int] NOT NULL,
    [shop_id] [int] NOT NULL,
    [order_id] [int] NULL,
    [rating] [int] NOT NULL,
    [content] [nvarchar](max) NULL,
    [is_visible] [bit] NOT NULL DEFAULT 1,
    [created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
    [updated_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

-- 5. Tạo bảng review_replies
CREATE TABLE [dbo].[review_replies](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [review_id] [int] NOT NULL,
    [merchant_id] [int] NOT NULL,
    [content] [nvarchar](max) NOT NULL,
    [created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
    [updated_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

-- 6. Thêm foreign key constraints
ALTER TABLE [dbo].[shops] ADD CONSTRAINT FK_shops_seller FOREIGN KEY ([seller_id]) REFERENCES [dbo].[users] ([id]);
ALTER TABLE [dbo].[products] ADD CONSTRAINT FK_products_shop FOREIGN KEY ([shop_id]) REFERENCES [dbo].[shops] ([id]);
ALTER TABLE [dbo].[products] ADD CONSTRAINT FK_products_category FOREIGN KEY ([category_id]) REFERENCES [dbo].[categories] ([id]);
ALTER TABLE [dbo].[orders] ADD CONSTRAINT FK_orders_buyer FOREIGN KEY ([buyer_id]) REFERENCES [dbo].[users] ([id]);
ALTER TABLE [dbo].[orders] ADD CONSTRAINT FK_orders_shop FOREIGN KEY ([shop_id]) REFERENCES [dbo].[shops] ([id]);

ALTER TABLE [dbo].[reviews] ADD CONSTRAINT FK_reviews_customer FOREIGN KEY ([customer_id]) REFERENCES [dbo].[users] ([id]);
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT FK_reviews_product FOREIGN KEY ([product_id]) REFERENCES [dbo].[products] ([id]);
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT FK_reviews_shop FOREIGN KEY ([shop_id]) REFERENCES [dbo].[shops] ([id]);
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT FK_reviews_order FOREIGN KEY ([order_id]) REFERENCES [dbo].[orders] ([id]);

ALTER TABLE [dbo].[review_replies] ADD CONSTRAINT FK_review_replies_review FOREIGN KEY ([review_id]) REFERENCES [dbo].[reviews] ([id]) ON DELETE CASCADE;
ALTER TABLE [dbo].[review_replies] ADD CONSTRAINT FK_review_replies_merchant FOREIGN KEY ([merchant_id]) REFERENCES [dbo].[users] ([id]);

-- 7. Thêm check constraints
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT CK_reviews_rating CHECK ([rating] >= 1 AND [rating] <= 5);

-- 8. Insert sample data
SET IDENTITY_INSERT [dbo].[users] ON;
INSERT [dbo].[users] ([id], [email], [password_hash], [full_name], [phone], [address], [role], [is_verified], [created_at], [updated_at]) 
VALUES 
(1, N'admin@example.com', N'hashedpass', N'Admin User', N'0500034420', N'123 Hanoi St, Hanoi', N'admin', 1, GETDATE(), GETDATE()),
(2, N'seller1@example.com', N'hashedpass', N'Seller One', N'0405451545', N'456 Saigon Ave, Ho Chi Minh City', N'seller', 1, GETDATE(), GETDATE()),
(3, N'seller2@example.com', N'hashedpass', N'Seller Two', N'0875227972', N'456 Saigon Ave, Ho Chi Minh City', N'seller', 1, GETDATE(), GETDATE()),
(4, N'buyer1@example.com', N'hashedpass', N'Buyer One', N'0465432660', N'123 Hanoi St, Hanoi', N'buyer', 1, GETDATE(), GETDATE()),
(5, N'buyer2@example.com', N'hashedpass', N'Buyer Two', N'0619812714', N'123 Hanoi St, Hanoi', N'buyer', 1, GETDATE(), GETDATE());
SET IDENTITY_INSERT [dbo].[users] OFF;
GO

SET IDENTITY_INSERT [dbo].[categories] ON;
INSERT [dbo].[categories] ([id], [name], [description], [created_at]) 
VALUES 
(1, N'Phở', N'Vietnamese noodle soup, ready-to-eat', GETDATE()),
(2, N'Bánh Mì', N'Vietnamese sandwich, ready-to-eat', GETDATE()),
(3, N'Cơm', N'Rice dishes, ready-to-eat', GETDATE()),
(4, N'Nước uống', N'Beverages including coffee, tea, and soft drinks', GETDATE());
SET IDENTITY_INSERT [dbo].[categories] OFF;
GO

SET IDENTITY_INSERT [dbo].[shops] ON;
INSERT [dbo].[shops] ([id], [seller_id], [name], [description], [address], [opening_hours], [rating], [created_at]) 
VALUES 
(1, 2, N'Pho Delicious', N'Best ready-to-eat Pho in town, delivered hot', N'100 Pho St, Hanoi', N'8AM-10PM', 4, GETDATE()),
(2, 3, N'Banh Mi King', N'Fresh ready-to-eat Banh Mi daily, fast delivery', N'200 Banh Mi Ave, Saigon', N'7AM-9PM', 5, GETDATE());
SET IDENTITY_INSERT [dbo].[shops] OFF;
GO

SET IDENTITY_INSERT [dbo].[products] ON;
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) 
VALUES 
(1, 1, 1, N'Pho Bo', N'Pho bo nong hoi, thom ngon, giao hang tan noi', 5, 1, N'http://localhost:8080/uploads/product-images/pho-bo.png', N'active', GETDATE(), GETDATE()),
(2, 1, 1, N'Pho Ga', N'Pho ga thom ngon, nuoc dung dam da, giao hang nong', 4.5, 1, N'http://localhost:8080/uploads/product-images/pho-ga.png', N'active', GETDATE(), GETDATE()),
(3, 2, 2, N'Banh Mi Thit', N'Banh mi thit nuong thom ngon, rau tuoi, giao hang nhanh', 3, 1, N'http://localhost:8080/uploads/product-images/banh-mi.png', N'active', GETDATE(), GETDATE());
SET IDENTITY_INSERT [dbo].[products] OFF;
GO

-- 9. Insert sample reviews
INSERT INTO [dbo].[reviews] ([customer_id], [product_id], [shop_id], [order_id], [rating], [content], [is_visible], [created_at], [updated_at])
VALUES 
(4, 1, 1, NULL, 5, N'Delicious ready-to-eat Pho!', 1, GETDATE(), GETDATE()),
(4, -1, 1, NULL, 4, N'Good service and fast delivery', 1, GETDATE(), GETDATE()),
(5, 2, 1, NULL, 4, N'Pho ga rất ngon!', 1, GETDATE(), GETDATE()),
(5, -1, 2, NULL, 5, N'Shop phục vụ tuyệt vời!', 1, GETDATE(), GETDATE());

PRINT '=== HOÀN THÀNH SETUP DATABASE ===';
PRINT 'Database đã được setup với schema tương thích Hibernate!';
PRINT 'Có thể chạy backend ngay bây giờ!';
