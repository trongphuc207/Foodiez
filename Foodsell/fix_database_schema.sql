-- Script để fix xung đột giữa database và Hibernate
-- Vấn đề: Database có 2 bảng reviews và shop_reviews, nhưng Hibernate chỉ có 1 entity Review

USE food_delivery_db6;
GO

-- 1. Kiểm tra cấu trúc hiện tại
PRINT '=== KIỂM TRA CẤU TRÚC HIỆN TẠI ===';

-- Kiểm tra bảng reviews
SELECT 'reviews table structure:' as info;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'reviews' 
ORDER BY ORDINAL_POSITION;

-- Kiểm tra bảng shop_reviews  
SELECT 'shop_reviews table structure:' as info;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'shop_reviews' 
ORDER BY ORDINAL_POSITION;

-- 2. Tạo bảng reviews mới phù hợp với Hibernate entity
PRINT '=== TẠO BẢNG REVIEWS MỚI ===';

-- Backup dữ liệu hiện tại
SELECT * INTO reviews_backup FROM reviews;
SELECT * INTO shop_reviews_backup FROM shop_reviews;

-- Xóa bảng cũ
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS shop_reviews;

-- Tạo bảng reviews mới theo Hibernate entity
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

-- Tạo bảng review_replies
CREATE TABLE [dbo].[review_replies](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [review_id] [int] NOT NULL,
    [merchant_id] [int] NOT NULL,
    [content] [nvarchar](max) NOT NULL,
    [created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
    [updated_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
    PRIMARY KEY CLUSTERED ([id] ASC)
);

-- 3. Thêm constraints và indexes
PRINT '=== THÊM CONSTRAINTS VÀ INDEXES ===';

-- Foreign keys cho reviews
ALTER TABLE [dbo].[reviews] 
ADD CONSTRAINT FK_reviews_customer 
FOREIGN KEY ([customer_id]) REFERENCES [dbo].[users] ([id]);

ALTER TABLE [dbo].[reviews] 
ADD CONSTRAINT FK_reviews_product 
FOREIGN KEY ([product_id]) REFERENCES [dbo].[products] ([id]);

ALTER TABLE [dbo].[reviews] 
ADD CONSTRAINT FK_reviews_shop 
FOREIGN KEY ([shop_id]) REFERENCES [dbo].[shops] ([id]);

ALTER TABLE [dbo].[reviews] 
ADD CONSTRAINT FK_reviews_order 
FOREIGN KEY ([order_id]) REFERENCES [dbo].[orders] ([id]);

-- Foreign keys cho review_replies
ALTER TABLE [dbo].[review_replies] 
ADD CONSTRAINT FK_review_replies_review 
FOREIGN KEY ([review_id]) REFERENCES [dbo].[reviews] ([id]) ON DELETE CASCADE;

ALTER TABLE [dbo].[review_replies] 
ADD CONSTRAINT FK_review_replies_merchant 
FOREIGN KEY ([merchant_id]) REFERENCES [dbo].[users] ([id]);

-- Check constraints
ALTER TABLE [dbo].[reviews] 
ADD CONSTRAINT CK_reviews_rating 
CHECK ([rating] >= 1 AND [rating] <= 5);

-- 4. Migrate dữ liệu từ bảng cũ
PRINT '=== MIGRATE DỮ LIỆU ===';

-- Migrate từ reviews_backup
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

-- Migrate từ shop_reviews_backup (tạo review cho shop)
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

-- 5. Cập nhật shops rating
PRINT '=== CẬP NHẬT SHOPS RATING ===';

UPDATE s
SET s.rating = ISNULL(CAST(ROUND(avg_rating.avg_val, 0) AS INT), 0)
FROM dbo.shops s
LEFT JOIN (
    SELECT shop_id, AVG(CAST(rating AS FLOAT)) as avg_val
    FROM dbo.reviews 
    WHERE is_visible = 1
    GROUP BY shop_id
) avg_rating ON avg_rating.shop_id = s.id;

-- 6. Cleanup
PRINT '=== CLEANUP ===';

-- Xóa bảng backup (tùy chọn)
-- DROP TABLE reviews_backup;
-- DROP TABLE shop_reviews_backup;

PRINT '=== HOÀN THÀNH FIX DATABASE SCHEMA ===';
PRINT 'Database đã được cập nhật để tương thích với Hibernate entity Review!';
