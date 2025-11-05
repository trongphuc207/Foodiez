-- PATCH để sửa file banfood.sql gốc
-- Chỉ thay thế phần CREATE TABLE reviews và shop_reviews

-- 1. Xóa bảng cũ (nếu có) - phải xóa constraints trước
-- Xóa foreign key constraints trước khi drop table
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_reviews_customer')
    ALTER TABLE [dbo].[reviews] DROP CONSTRAINT FK_reviews_customer;
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_reviews_product')
    ALTER TABLE [dbo].[reviews] DROP CONSTRAINT FK_reviews_product;
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_reviews_shop')
    ALTER TABLE [dbo].[reviews] DROP CONSTRAINT FK_reviews_shop;
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_reviews_order')
    ALTER TABLE [dbo].[reviews] DROP CONSTRAINT FK_reviews_order;
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_review_replies_review')
    ALTER TABLE [dbo].[review_replies] DROP CONSTRAINT FK_review_replies_review;
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_review_replies_merchant')
    ALTER TABLE [dbo].[review_replies] DROP CONSTRAINT FK_review_replies_merchant;

-- Xóa check constraints
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_reviews_rating')
    ALTER TABLE [dbo].[reviews] DROP CONSTRAINT CK_reviews_rating;

-- Bây giờ mới drop table
DROP TABLE IF EXISTS [dbo].[shop_reviews];
DROP TABLE IF EXISTS [dbo].[review_replies];
DROP TABLE IF EXISTS [dbo].[reviews];

-- 2. Tạo bảng reviews mới tương thích Hibernate
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
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- 3. Tạo bảng review_replies mới
CREATE TABLE [dbo].[review_replies](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[review_id] [int] NOT NULL,
	[merchant_id] [int] NOT NULL,
	[content] [nvarchar](max) NOT NULL,
	[created_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
	[updated_at] [datetime2](7) NOT NULL DEFAULT GETDATE(),
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

-- 4. Sửa cột rating trong bảng shops từ decimal(3,2) thành int
-- Trước tiên phải xóa default constraint
DECLARE @constraint_name NVARCHAR(128);
SELECT @constraint_name = name FROM sys.default_constraints WHERE parent_object_id = OBJECT_ID('shops') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('shops'), 'rating', 'ColumnId');
IF @constraint_name IS NOT NULL
    EXEC('ALTER TABLE [dbo].[shops] DROP CONSTRAINT ' + @constraint_name);

-- Sau đó mới alter column
ALTER TABLE [dbo].[shops] ALTER COLUMN [rating] [int] NULL;
GO

-- 5. Thêm foreign key constraints cho reviews (chỉ nếu chưa tồn tại)
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_reviews_customer')
    ALTER TABLE [dbo].[reviews] ADD CONSTRAINT FK_reviews_customer FOREIGN KEY ([customer_id]) REFERENCES [dbo].[users] ([id]);
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_reviews_product')
    ALTER TABLE [dbo].[reviews] ADD CONSTRAINT FK_reviews_product FOREIGN KEY ([product_id]) REFERENCES [dbo].[products] ([id]);
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_reviews_shop')
    ALTER TABLE [dbo].[reviews] ADD CONSTRAINT FK_reviews_shop FOREIGN KEY ([shop_id]) REFERENCES [dbo].[shops] ([id]);
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_reviews_order')
    ALTER TABLE [dbo].[reviews] ADD CONSTRAINT FK_reviews_order FOREIGN KEY ([order_id]) REFERENCES [dbo].[orders] ([id]);
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_review_replies_review')
    ALTER TABLE [dbo].[review_replies] ADD CONSTRAINT FK_review_replies_review FOREIGN KEY ([review_id]) REFERENCES [dbo].[reviews] ([id]) ON DELETE CASCADE;
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_review_replies_merchant')
    ALTER TABLE [dbo].[review_replies] ADD CONSTRAINT FK_review_replies_merchant FOREIGN KEY ([merchant_id]) REFERENCES [dbo].[users] ([id]);
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_reviews_rating')
    ALTER TABLE [dbo].[reviews] ADD CONSTRAINT CK_reviews_rating CHECK ([rating] >= 1 AND [rating] <= 5);

-- 6. Migrate dữ liệu từ bảng cũ (nếu có)
-- Insert sample data tương thích với cấu trúc mới
-- Chỉ insert nếu product_id tồn tại
INSERT INTO [dbo].[reviews] ([customer_id], [product_id], [shop_id], [order_id], [rating], [content], [is_visible], [created_at], [updated_at])
SELECT 4, 1, 1, 1, 5, N'Delicious ready-to-eat Pho!', 1, CAST(N'2025-09-30T19:54:50.2500000' AS DateTime2), CAST(N'2025-09-30T19:54:50.2500000' AS DateTime2)
WHERE EXISTS (SELECT 1 FROM [dbo].[products] WHERE [id] = 1);

-- Insert shop review (không cần product_id)
INSERT INTO [dbo].[reviews] ([customer_id], [product_id], [shop_id], [order_id], [rating], [content], [is_visible], [created_at], [updated_at])
SELECT 4, 1, 1, 1, 4, N'Good service and fast delivery', 1, CAST(N'2025-09-30T19:54:50.2533333' AS DateTime2), CAST(N'2025-09-30T19:54:50.2533333' AS DateTime2)
WHERE EXISTS (SELECT 1 FROM [dbo].[products] WHERE [id] = 1);

PRINT '=== HOÀN THÀNH PATCH DATABASE ===';
PRINT 'Đã sửa reviews table để tương thích với Hibernate!';

