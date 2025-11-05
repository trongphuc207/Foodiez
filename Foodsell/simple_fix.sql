-- Script đơn giản để fix xung đột database với Hibernate
USE food_delivery_db6;
GO

PRINT '=== BẮT ĐẦU FIX DATABASE SCHEMA ===';

-- 1. Backup dữ liệu hiện tại
PRINT '1. Backup dữ liệu...';
SELECT * INTO reviews_backup FROM reviews;
SELECT * INTO shop_reviews_backup FROM shop_reviews;

-- 2. Xóa bảng cũ
PRINT '2. Xóa bảng cũ...';
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS shop_reviews;

-- 3. Tạo bảng reviews mới
PRINT '3. Tạo bảng reviews mới...';
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

-- 4. Tạo bảng review_replies
PRINT '4. Tạo bảng review_replies...';
CREATE TABLE [dbo].[review_replies](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [review_id] [int] NOT NULL,
    [merchant_id] [int] NOT NULL,
    [content] [nvarchar](max) NOT NULL,
    [created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
    [updated_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY CLUSTERED ([id] ASC)
);

-- 5. Thêm foreign keys
PRINT '5. Thêm foreign keys...';
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT FK_reviews_customer FOREIGN KEY ([customer_id]) REFERENCES [dbo].[users] ([id]);
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT FK_reviews_product FOREIGN KEY ([product_id]) REFERENCES [dbo].[products] ([id]);
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT FK_reviews_shop FOREIGN KEY ([shop_id]) REFERENCES [dbo].[shops] ([id]);
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT FK_reviews_order FOREIGN KEY ([order_id]) REFERENCES [dbo].[orders] ([id]);
ALTER TABLE [dbo].[review_replies] ADD CONSTRAINT FK_review_replies_review FOREIGN KEY ([review_id]) REFERENCES [dbo].[reviews] ([id]) ON DELETE CASCADE;
ALTER TABLE [dbo].[review_replies] ADD CONSTRAINT FK_review_replies_merchant FOREIGN KEY ([merchant_id]) REFERENCES [dbo].[users] ([id]);

-- 6. Thêm check constraints
PRINT '6. Thêm check constraints...';
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT CK_reviews_rating CHECK ([rating] >= 1 AND [rating] <= 5);

-- 7. Migrate dữ liệu từ reviews_backup
PRINT '7. Migrate dữ liệu từ reviews_backup...';
INSERT INTO [dbo].[reviews] ([customer_id], [product_id], [shop_id], [order_id], [rating], [content], [is_visible], [created_at], [updated_at])
SELECT 
    [user_id] as [customer_id],
    [product_id],
    (SELECT shop_id FROM products WHERE id = [product_id]) as [shop_id],
    [order_id],
    [rating],
    [comment] as [content],
    1 as [is_visible],
    [created_at],
    [created_at] as [updated_at]
FROM reviews_backup;

-- 8. Migrate dữ liệu từ shop_reviews_backup
PRINT '8. Migrate dữ liệu từ shop_reviews_backup...';
INSERT INTO [dbo].[reviews] ([customer_id], [product_id], [shop_id], [order_id], [rating], [content], [is_visible], [created_at], [updated_at])
SELECT 
    [user_id] as [customer_id],
    -1 as [product_id], -- -1 để đánh dấu là review cho shop
    [shop_id],
    [order_id],
    [rating],
    [comment] as [content],
    1 as [is_visible],
    [created_at],
    [created_at] as [updated_at]
FROM shop_reviews_backup;

-- 9. Cập nhật shops rating (FIXED VERSION)
PRINT '9. Cập nhật shops rating...';

-- Cách 1: Sử dụng CTE (Common Table Expression)
WITH ShopRatings AS (
    SELECT 
        shop_id, 
        CAST(ROUND(AVG(CAST(rating AS FLOAT)), 0) AS INT) as avg_rating
    FROM dbo.reviews 
    WHERE is_visible = 1 AND product_id != -1  -- Chỉ tính product reviews
    GROUP BY shop_id
)
UPDATE s
SET s.rating = ISNULL(sr.avg_rating, 0)
FROM dbo.shops s
LEFT JOIN ShopRatings sr ON sr.shop_id = s.id;

PRINT '=== HOÀN THÀNH FIX DATABASE SCHEMA ===';
PRINT 'Database đã được cập nhật để tương thích với Hibernate entity Review!';
