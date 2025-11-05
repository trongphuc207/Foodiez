-- =============================================
-- Merged Database Script (Final, Complete & Fixed)
-- Merged from: database.sql and lamlai.sql
-- Date: 2025-11-05
-- =============================================

-- Use the correct database name (replace if necessary)
USE [food_delivery_db10];
GO

-- Drop existing objects to prevent errors on re-run
IF OBJECT_ID('dbo.fn_is_admin', 'FN') IS NOT NULL DROP FUNCTION dbo.fn_is_admin;
IF OBJECT_ID('dbo.sp_admin_update_user', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_admin_update_user;
IF OBJECT_ID('dbo.sp_admin_soft_delete_user', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_admin_soft_delete_user;
IF OBJECT_ID('dbo.sp_admin_hard_delete_user', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_admin_hard_delete_user;
IF OBJECT_ID('dbo.GenerateComplaintNumber', 'FN') IS NOT NULL DROP FUNCTION dbo.GenerateComplaintNumber;
IF OBJECT_ID('trg_GenerateComplaintNumber', 'TR') IS NOT NULL DROP TRIGGER trg_GenerateComplaintNumber;

IF OBJECT_ID('dbo.complaint_responses', 'U') IS NOT NULL DROP TABLE dbo.complaint_responses;
IF OBJECT_ID('dbo.complaint_images', 'U') IS NOT NULL DROP TABLE dbo.complaint_images;
IF OBJECT_ID('dbo.complaints', 'U') IS NOT NULL DROP TABLE dbo.complaints;
IF OBJECT_ID('dbo.complaint_categories', 'U') IS NOT NULL DROP TABLE dbo.complaint_categories;
IF OBJECT_ID('dbo.order_history', 'U') IS NOT NULL DROP TABLE dbo.order_history;
IF OBJECT_ID('dbo.shippers', 'U') IS NOT NULL DROP TABLE dbo.shippers;
IF OBJECT_ID('dbo.admin_logs', 'U') IS NOT NULL DROP TABLE dbo.admin_logs;
IF OBJECT_ID('dbo.revenue_stats', 'U') IS NOT NULL DROP TABLE dbo.revenue_stats;
IF OBJECT_ID('dbo.cart_items', 'U') IS NOT NULL DROP TABLE dbo.cart_items;
IF OBJECT_ID('dbo.carts', 'U') IS NOT NULL DROP TABLE dbo.carts;
IF OBJECT_ID('dbo.favorites', 'U') IS NOT NULL DROP TABLE dbo.favorites;
IF OBJECT_ID('dbo.user_vouchers', 'U') IS NOT NULL DROP TABLE dbo.user_vouchers;
IF OBJECT_ID('dbo.role_applications', 'U') IS NOT NULL DROP TABLE dbo.role_applications;
IF OBJECT_ID('dbo.shop_reviews', 'U') IS NOT NULL DROP TABLE dbo.shop_reviews;
IF OBJECT_ID('dbo.reviews', 'U') IS NOT NULL DROP TABLE dbo.reviews;
IF OBJECT_ID('dbo.order_status_history', 'U') IS NOT NULL DROP TABLE dbo.order_status_history;
IF OBJECT_ID('dbo.order_items', 'U') IS NOT NULL DROP TABLE dbo.order_items;
IF OBJECT_ID('dbo.payments', 'U') IS NOT NULL DROP TABLE dbo.payments;
IF OBJECT_ID('dbo.payment_methods', 'U') IS NOT NULL DROP TABLE dbo.payment_methods;
IF OBJECT_ID('dbo.messages', 'U') IS NOT NULL DROP TABLE dbo.messages;
IF OBJECT_ID('dbo.chats', 'U') IS NOT NULL DROP TABLE dbo.chats;
IF OBJECT_ID('dbo.deliveries', 'U') IS NOT NULL DROP TABLE dbo.deliveries;
IF OBJECT_ID('dbo.delivery_zones', 'U') IS NOT NULL DROP TABLE dbo.delivery_zones;
IF OBJECT_ID('dbo.orders', 'U') IS NOT NULL DROP TABLE dbo.orders;
IF OBJECT_ID('dbo.delivery_addresses', 'U') IS NOT NULL DROP TABLE dbo.delivery_addresses;
IF OBJECT_ID('dbo.products', 'U') IS NOT NULL DROP TABLE dbo.products;
IF OBJECT_ID('dbo.vouchers', 'U') IS NOT NULL DROP TABLE dbo.vouchers;
IF OBJECT_ID('dbo.shops', 'U') IS NOT NULL DROP TABLE dbo.shops;
IF OBJECT_ID('dbo.verification_codes', 'U') IS NOT NULL DROP TABLE dbo.verification_codes;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
IF OBJECT_ID('dbo.categories', 'U') IS NOT NULL DROP TABLE dbo.categories;
GO

-- =============================================
-- Table Creation
-- =============================================
CREATE TABLE [dbo].[categories](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[users](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[email] [nvarchar](255) NOT NULL,
	[password_hash] [nvarchar](255) NOT NULL,
	[full_name] [nvarchar](255) NOT NULL,
	[phone] [nvarchar](255) NULL,
	[address] [nvarchar](max) NULL,
	[role] [nvarchar](20) NOT NULL DEFAULT ('buyer'),
	[is_verified] [bit] NULL DEFAULT ((0)),
	[is_banned] [bit] NULL DEFAULT 0,
	[status] [nvarchar](20) NULL DEFAULT 'ACTIVE',
	[banned] [bit] NULL DEFAULT 0,
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	[updated_at] [datetime2](7) NULL DEFAULT (getdate()),
	[deleted_at] [datetime2](7) NULL,
	[reset_token] [varchar](255) NULL,
	[reset_token_expiry] [datetime2](6) NULL,
	[profile_image] [varchar](255) NULL,
	[verification_token] [varchar](255) NULL,
	[verification_token_expiry] [datetime2](6) NULL,
	[otp_code] [varchar](255) NULL,
	[otp_expiry] [datetime2](6) NULL,
	[date_of_birth] [date] NULL,
    [gender] [nvarchar](10) NULL,
    [id_number] [nvarchar](20) NULL,
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
	[rating] [decimal](3, 2) NULL DEFAULT ((0.00)),
	[is_banned] [bit] NULL,
	[ban_reason] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	[latitude] [float] NULL,
	[longitude] [float] NULL,
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[products](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[shop_id] [int] NOT NULL,
	[category_id] [int] NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[description] [nvarchar](max) NULL,
	[price] [float] NULL,
	[is_available] [bit] NULL DEFAULT ((1)),
	[image_url] [nvarchar](500) NULL,
	[status] [nvarchar](20) NULL DEFAULT ('active'),
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	[updated_at] [datetime2](7) NULL DEFAULT (getdate()),
    [approval_status] NVARCHAR(50) NOT NULL DEFAULT 'approved',
    [rejection_reason] NVARCHAR(MAX) NULL,
    [admin_note] NVARCHAR(MAX) NULL,
    [reviewed_by] INT NULL,
    [reviewed_at] DATETIME2(7) NULL,
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[vouchers](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[code] [nvarchar](50) NOT NULL,
	[discount_type] [nvarchar](20) NOT NULL,
	[discount_value] [decimal](10, 2) NOT NULL,
	[min_order_value] [decimal](10, 2) NULL,
	[expiry_date] [date] NOT NULL,
	[max_uses] [int] NULL,
	[quantity] [int] NULL,
	[used_count] [int] NULL DEFAULT ((0)),
	[created_by] [int] NOT NULL,
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	[is_active] [bit] NULL DEFAULT ((1)),
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[delivery_addresses](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[address_name] [nvarchar](100) NOT NULL,
	[full_address] [nvarchar](max) NOT NULL,
	[phone] [nvarchar](20) NULL,
	[is_default] [bit] NULL DEFAULT ((0)),
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[orders](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[buyer_id] [int] NOT NULL,
	[shop_id] [int] NOT NULL,
	[delivery_address_id] [int] NOT NULL,
	[total_amount] [numeric](19, 4) NOT NULL,
	[status] [nvarchar](20) NULL DEFAULT ('pending'),
	[voucher_id] [int] NULL,
	[notes] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	[recipient_name] [nvarchar](100) NULL,
	[recipient_phone] [nvarchar](20) NULL,
	[address_text] [nvarchar](max) NULL,
	[latitude] [float] NULL,
	[longitude] [float] NULL,
    [deleted_at] DATETIME2 NULL,
	[order_code] [int] NULL,
	[updated_at] [datetime2](6) NULL,
	[accepted_at] [datetime2](6) NULL,
	[assigned_at] [datetime2](6) NULL,
	[assigned_seller_id] [int] NULL,
	[assigned_shipper_id] [int] NULL,
	[assignment_status] [varchar](255) NULL,
	[delivery_fee] [float] NULL,
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[order_items](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NOT NULL,
	[product_id] [int] NOT NULL,
	[quantity] [int] NOT NULL,
	[unit_price] [numeric](19, 4) NOT NULL,
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[carts](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[created_at] [datetime2](6) NOT NULL,
	[updated_at] [datetime2](6) NOT NULL,
	[user_id] [int] NOT NULL,
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[cart_items](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[created_at] [datetime2](6) NOT NULL,
	[price] [numeric](38, 2) NOT NULL,
	[product_id] [int] NOT NULL,
	[quantity] [int] NOT NULL,
	[cart_id] [int] NOT NULL,
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[chats](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NULL,
	[buyer_id] [int] NOT NULL,
	[seller_id] [int] NULL,
	[is_bot] [bit] NULL DEFAULT ((0)),
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[deliveries](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NOT NULL,
	[shipper_id] [int] NULL,
	[status] [nvarchar](20) NULL DEFAULT ('assigned'),
	[tracking_code] [nvarchar](100) NULL,
	[delivered_at] [datetime2](7) NULL,
	[failure_reason] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[delivery_zones](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[shop_id] [int] NOT NULL,
	[zone_name] [nvarchar](100) NOT NULL,
	[delivery_fee] [decimal](10, 2) NOT NULL,
	[min_order_value] [decimal](10, 2) NULL DEFAULT ((0)),
	[estimated_time] [int] NOT NULL,
	[is_active] [bit] NULL DEFAULT ((1)),
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[messages](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[chat_id] [int] NOT NULL,
	[sender_id] [int] NULL,
	[message] [nvarchar](max) NOT NULL,
	[is_bot] [bit] NULL DEFAULT ((0)),
	[timestamp] [datetime2](7) NULL DEFAULT (getdate()),
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[notifications](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[type] [nvarchar](20) NOT NULL,
	[title] [nvarchar](255) NULL,
	[message] [nvarchar](max) NOT NULL,
	[is_read] [bit] NULL DEFAULT ((0)),
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[order_status_history](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NOT NULL,
	[status] [nvarchar](20) NOT NULL,
	[notes] [nvarchar](max) NULL,
	[changed_by] [int] NULL,
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[payment_methods](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](max) NULL,
	[is_active] [bit] NULL DEFAULT ((1)),
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[payments](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NOT NULL,
	[payment_method_id] [int] NOT NULL,
	[amount] [decimal](10, 2) NOT NULL,
	[status] [nvarchar](20) NULL DEFAULT ('pending'),
	[transaction_id] [nvarchar](255) NULL,
	[payment_date] [datetime2](7) NULL,
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[reviews](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NULL,
	[product_id] [int] NOT NULL,
	[user_id] [int] NOT NULL,
	[rating] [int] NULL,
	[comment] [nvarchar](max) NULL,
	[image_url] [nvarchar](500) NULL,
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[shop_reviews](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NULL,
	[shop_id] [int] NOT NULL,
	[user_id] [int] NOT NULL,
	[rating] [int] NULL,
	[comment] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[verification_codes](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[code] [varchar](255) NOT NULL,
	[created_at] [datetime2](6) NOT NULL,
	[email] [varchar](255) NOT NULL,
	[expires_at] [datetime2](6) NOT NULL,
	[is_used] [bit] NOT NULL,
	[type] [varchar](255) NOT NULL,
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[role_applications](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[requested_role] [nvarchar](50) NOT NULL,
	[status] [nvarchar](50) NOT NULL,
	[reason] [nvarchar](max) NULL,
	[admin_note] [nvarchar](max) NULL,
	[reviewed_by] [int] NULL,
	[created_at] [datetime2](7) NULL,
	[reviewed_at] [datetime2](7) NULL,
	[shop_name] [nvarchar](255) NULL,
	[shop_address] [nvarchar](max) NULL,
	[shop_description] [nvarchar](max) NULL,
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[user_vouchers](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[voucher_id] [int] NOT NULL,
	[is_used] [bit] NOT NULL DEFAULT ((0)),
	[used_at] [datetime2](7) NULL,
	[claimed_at] [datetime2](7) NULL DEFAULT (getdate()),
	[order_id] [int] NULL,
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[admin_logs](
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [admin_id] INT NOT NULL,
    [action_type] NVARCHAR(50),
    [entity_name] NVARCHAR(100),
    [entity_id] INT,
    [description] NVARCHAR(MAX),
    [created_at] DATETIME2 DEFAULT GETDATE()
);
GO
CREATE TABLE [dbo].[revenue_stats](
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [shop_id] INT,
    [total_orders] INT DEFAULT 0,
    [total_revenue] DECIMAL(10,2) DEFAULT 0,
    [month] INT,
    [year] INT,
    [created_at] DATETIME2 DEFAULT GETDATE()
);
GO
CREATE TABLE [dbo].[favorites](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[product_id] [int] NOT NULL,
	[created_at] [datetime2](7) NULL DEFAULT (getdate()),
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[order_history](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[action] [varchar](255) NOT NULL,
	[created_at] [datetime2](6) NULL,
	[created_by] [varchar](255) NULL,
	[description] [nvarchar](max) NULL,
	[order_id] [int] NOT NULL,
	[status_from] [varchar](255) NULL,
	[status_to] [varchar](255) NOT NULL,
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE [dbo].[shippers](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[created_at] [datetime2](6) NULL,
	[delivery_area] [varchar](255) NULL,
	[is_available] [bit] NULL,
	[license_plate] [varchar](255) NULL,
	[rating] [float] NULL,
	[total_deliveries] [int] NULL,
	[total_earnings] [float] NULL,
	[updated_at] [datetime2](6) NULL,
	[user_id] [int] NOT NULL,
	[vehicle_type] [varchar](255) NULL,
	PRIMARY KEY CLUSTERED ([id] ASC)
);
GO
CREATE TABLE complaints (
    id INT IDENTITY(1,1) PRIMARY KEY,
    complaint_number VARCHAR(20) UNIQUE NOT NULL, 
    complainant_id INT NOT NULL,
    complainant_type VARCHAR(20) NOT NULL,
    respondent_id INT,
    respondent_type VARCHAR(20),
    category VARCHAR(50) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description NTEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'normal',
    assigned_admin_id INT,
    admin_note NTEXT,
    admin_decision VARCHAR(20),
    decision_reason NTEXT,
    related_order_id INT,
    related_product_id INT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    resolved_at DATETIME
);
GO
CREATE TABLE complaint_images (
    id INT IDENTITY(1,1) PRIMARY KEY,
    complaint_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_type VARCHAR(20) DEFAULT 'evidence',
    description VARCHAR(200),
    uploaded_at DATETIME DEFAULT GETDATE()
);
GO
CREATE TABLE complaint_responses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    complaint_id INT NOT NULL,
    user_id INT NOT NULL,
    user_role VARCHAR(20) NOT NULL,
    message NTEXT NOT NULL,
    is_internal_note BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE()
);
GO
CREATE TABLE complaint_categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    category_code VARCHAR(50) UNIQUE NOT NULL,
    category_name_vi NVARCHAR(100) NOT NULL,
    category_name_en VARCHAR(100) NOT NULL,
    description NVARCHAR(200),
    is_active BIT DEFAULT 1
);
GO
-- =============================================
-- Insert Data
-- =============================================
SET IDENTITY_INSERT [dbo].[users] ON;
INSERT INTO [dbo].[users] ([id], [email], [password_hash], [full_name], [phone], [address], [role], [is_verified], [status], [banned], [created_at], [updated_at]) VALUES
(1, 'admin@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Admin User', '0500034420', '123 Hanoi St, Hanoi', 'admin', 1, 'ACTIVE', 0, '2025-09-30T19:54:50.140', '2025-09-30T19:54:50.140'),
(2, 'seller1@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Seller One', '0405451545', '456 Saigon Ave, Ho Chi Minh City', 'seller', 1, 'ACTIVE', 0, '2025-09-30T19:54:50.143', '2025-09-30T19:54:50.143'),
(3, 'seller2@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Seller Two', '0875227972', '456 Saigon Ave, Ho Chi Minh City', 'seller', 1, 'ACTIVE', 0, '2025-09-30T19:54:50.143', '2025-09-30T19:54:50.143'),
(4, 'buyer1@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Buyer One', '0465432660', '123 Hanoi St, Hanoi', 'buyer', 1, 'ACTIVE', 0, '2025-09-30T19:54:50.143', '2025-09-30T19:54:50.143'),
(5, 'buyer2@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Buyer Two', '0619812714', '123 Hanoi St, Hanoi', 'buyer', 1, 'ACTIVE', 0, '2025-09-30T19:54:50.143', '2025-09-30T19:54:50.143'),
(6, 'shipper1@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Shipper One', '0390633094', '789 Da Nang Blvd, Da Nang', 'shipper', 1, 'ACTIVE', 0, '2025-09-30T19:54:50.143', '2025-09-30T19:54:50.143'),
(7, 'trongphuc20704@gmail.com', '9e8b9dc5ee1b3a93e090a867254974bbe40a4a4d6e6d9192914167ef4f8b6ff2', 'Trong Phuc', '0778956030', 'Da Nang', 'buyer', 1, 'ACTIVE', 0, '2025-10-01T23:19:04.300', '2025-10-08T07:52:10.983'),
(8, 'phuclt207@gmail.com', '$2a$10$K1NZVWmIU9hyPRqVj.dIc.xSmnm6jEefxyBW6CqeHI81.zrgGI9Tu', 'Phuc', '', 'Viet Nam', 'buyer', 0, 'ACTIVE', 0, '2025-10-01T23:34:32.553', '2025-10-01T23:34:32.553'),
(9, 'seller3@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Seller Three', '0123456789', 'Da Nang', 'seller', 1, 'ACTIVE', 0, '2025-10-19T21:47:53.730', '2025-10-19T21:47:53.730'),
(10, 'seller4@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Seller Four', '0123456789', 'Hoi An', 'seller', 1, 'ACTIVE', 0, '2025-10-19T21:47:53.730', '2025-10-19T21:47:53.730'),
(11, 'seller5@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Seller Five', '0123456789', 'Nha Trang', 'seller', 1, 'ACTIVE', 0, '2025-10-19T21:47:53.730', '2025-10-19T21:47:53.730'),
(12, 'seller6@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Seller Six', '0123456789', 'HCM', 'seller', 1, 'ACTIVE', 0, '2025-10-19T21:47:53.730', '2025-10-19T21:47:53.730'),
(13, 'seller7@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Seller Seven', '0123456789', 'HCM', 'seller', 1, 'ACTIVE', 0, '2025-10-19T21:47:53.730', '2025-10-19T21:47:53.730'),
(14, 'testemaild086@gmail.com', '$2a$10$Bp4B.HutoVjJ0guSUJOJeOV2XdVfr8Cu7gPDgSuoFG4kKxrzAmoE2', 'trần đông', NULL, NULL, 'admin', 0, 'ACTIVE', 0, '2025-10-19T21:58:22.660', '2025-10-19T23:30:29.843'),
(15, 'Dh5027296@gmail.com', '$2a$10$/h/M4aEqz6lqc50.qlPZ1uTxQ0sHUh3cjyTDxX8/cHyEQLAw9DCxi', 'rrararar', '0123456789', 'le van hien', 'SHIPPER', 0, 'ACTIVE', 0, '2025-10-19T21:59:13.854', '2025-11-05T08:58:33.940'),
(16, 'ransotestvn1997@gmail.com', '$2a$10$dM11ctGcboZBnffG3yb7x.oBEy9FeWWWQjDDEEGklJ/6F0io2vipG', 'trần đông', NULL, NULL, 'buyer', 0, 'ACTIVE', 0, '2025-10-19T22:05:19.090', '2025-11-01T19:17:15.130'),
(17, 'dongzz010304@gmail.com', '$2a$10$fMvbnujAzX.dvqcsV1O82egZXO/981DVni1kFe9ejWJXxKolMlxWe', 'trần đông', NULL, NULL, 'buyer', 1, 'ACTIVE', 0, '2025-10-19T22:10:45.977', '2025-10-19T22:12:30.323'),
(18, 'tvdong01032004@gmail.com', '$2a$10$ViiXbej8f0cDCtYZl4k5ueZnE5yFQVwsTbO3.ZgzCVjQDTsXhq.e2', 'Seller Account', NULL, NULL, 'seller', 1, 'ACTIVE', 0, '2025-10-21T09:30:18.195', '2025-11-01T19:41:11.493'),
(19, 'test@test.com', '$2a$10$SmHoTYg1DbuHpmI21n8xI.s.HQ5ks03d5VmejWcigWkUaPovWgViK', 'Test User', NULL, NULL, 'buyer', 1, 'ACTIVE', 0, '2025-10-25T09:54:54.501', '2025-10-25T09:55:29.420'),
(20, 'test-buyer@example.com', 'hashedpassword', 'Test Buyer', '0123456789', 'Test address', 'buyer', 1, 'ACTIVE', 0, '2025-10-28T23:46:13.673', '2025-10-28T23:46:13.673');
SET IDENTITY_INSERT [dbo].[users] OFF;
GO
SET IDENTITY_INSERT [dbo].[shops] ON;
INSERT INTO [dbo].[shops] ([id], [seller_id], [name], [description], [address], [opening_hours], [rating], [created_at]) VALUES
(1, 2, 'Pho Delicious', 'Best ready-to-eat Pho in town, delivered hot', '100 Pho St, Hanoi', '8AM-10PM', 4.50, '2025-09-30T19:54:50.170'),
(2, 3, 'Banh Mi King', 'Fresh ready-to-eat Banh Mi daily, fast delivery', '200 Banh Mi Ave, Saigon', '7AM-9PM', 4.80, '2025-09-30T19:54:50.170'),
(3, 9, 'Mì Quảng 123', 'Mì Quảng truyền thống Ðà Nẵng với tôm, thịt và rau thom tuoi.', '12 Nguyễn Van Linh, Hải Châu, Ðà Nẵng', '7AM-9PM', 4.60, '2025-10-09T07:16:38.620'),
(4, 10, 'Com Gà Bà Buội', 'Món com gà Hội An nổi tiếng, gạo vàng nghệ, nước chấm cay đặc trưng.', '45 Lê Duẩn, Hải Châu, Ðà Nẵng', '8AM-10PM', 4.70, '2025-10-09T07:16:38.620'),
(5, 11, 'Bún Chả Cá 109', 'Bún chả cá Ðà Nẵng tuoi ngon, nước dùng đậm đà, phục vụ nhanh chóng.', '109 Nguyễn Chí Thanh, Hải Châu, Ðà Nẵng', '6AM-8PM', 4.50, '2025-10-09T07:16:38.620'),
(6, 12, 'Pizza Zone', 'Pizza phong cách Ý với huong vị dặc trung và giao hàng nhanh chóng.', '80 Phan Châu Trinh, Hải Châu, Ðà Nẵng', '10AM-11PM', 4.80, '2025-10-09T07:16:38.620'),
(7, 13, 'Coffee & Chill', 'Quán cà phê ấm cúng với đồ uống đa dạng, bánh ngọt và wifi miễn phí.', '21 Trần Phú, Hải Châu, Ðà Nẵng', '7AM-10PM', 4.90, '2025-10-09T07:16:38.620');
SET IDENTITY_INSERT [dbo].[shops] OFF;
GO
SET IDENTITY_INSERT [dbo].[categories] ON;
INSERT INTO [dbo].[categories] ([id], [name], [description], [created_at]) VALUES
(1, 'Phở', 'Vietnamese noodle soup, ready-to-eat', '2025-09-30T19:54:50.163'),
(2, 'Bánh Mì', 'Vietnamese sandwich, ready-to-eat', '2025-09-30T19:54:50.163'),
(3, 'Cơm', 'Rice dishes, ready-to-eat', '2025-09-30T19:54:50.163'),
(4, 'Nước uống', 'Beverages including coffee, tea, and soft drinks', '2025-10-09T07:32:55.270'),
(5, 'Pizza', 'Món pizza phong cách Ý, nhiều loại topping đa dạng.', '2025-10-10T15:57:31.600'),
(6, 'Bún', 'Món bún Việt Nam truyền thống, dùng với thịt, chả hoặc hải sản.', '2025-10-10T15:57:31.600');
SET IDENTITY_INSERT [dbo].[categories] OFF;
GO
SET IDENTITY_INSERT [dbo].[products] ON;
INSERT INTO [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES
(1, 1, 1, 'Pho Bo', 'Pho bo nong hoi, thom ngon, giao hang tan noi', 35000, 1, 'http://localhost:8080/uploads/product-images/108e4ac9-afa1-41d9-bfa3-21a87f48231d.png', 'active', '2025-09-30T19:54:50.173', '2025-10-09T09:56:32.190'),
(2, 1, 1, 'Pho Ga', 'Pho ga thom ngon, nuoc dung dam da, giao hang nong', 40000, 1, 'http://localhost:8080/uploads/product-images/853f1d3f-9620-44ee-b400-69a7423ae9f9.png', 'active', '2025-09-30T19:54:50.176', '2025-10-09T09:53:59.973'),
(3, 2, 2, 'Banh Mi Thit', 'Banh mi thit nuong thom ngon, rau tuoi, giao hang nhanh', 45000, 1, 'http://localhost:8080/uploads/product-images/ea11bcc5-f9e0-47d8-bca8-b7c651f23f95.png', 'active', '2025-09-30T19:54:50.176', '2025-10-09T18:48:02.623'),
(4, 2, 3, 'Com Ga', 'Com ga Hoi An thom ngon, gao vang nghe, nuoc cham dam da', 4, 1, 'http://localhost:8080/uploads/product-images/2c2e5602-bbf3-4e52-9a21-fcd18e4dc2d9.png', 'active', '2025-09-30T19:54:50.176', '2025-10-09T18:48:53.423'),
(5, 3, 1, 'Mì Quảng Tôm Thịt', 'Mi Quang dac san Da Nang voi tom, thit va rau song.', 4, 1, 'http://localhost:8080/uploads/product-images/a47535d5-188c-4415-be4e-9bcfe297b040.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T18:49:30.363'),
(6, 3, 1, 'Mì Quảng Gà', 'Mi Quang ga thom ngon, an kem rau thom va dau phong.', 3.8, 1, 'http://localhost:8080/uploads/product-images/0934f1d8-025d-4055-8a86-bd63d614d6b9.jpg', 'active', '2025-10-09T07:20:20.846', '2025-10-09T18:50:28.906'),
(7, 3, 3, 'Bánh Tráng Cuốn Thịt Heo', 'Banh trang cuon thit heo tuoi ngon, nuoc cham dam vi mien Trung.', 4.5, 1, 'http://localhost:8080/uploads/product-images/ecfcd397-682a-4774-9e96-b5f5f6715908.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T18:51:29.903'),
(8, 3, 3, 'Bún Mắm', 'Bun mam Da Nang, huong vi dac trung manh me.', 4.2, 1, 'http://localhost:8080/uploads/product-images/6f053d01-3de4-4645-90f0-f4857cb52cba.jpg', 'active', '2025-10-09T07:20:20.846', '2025-10-09T18:52:54.170'),
(9, 3, 3, 'Cơm Hến', 'Com hen Hue cay nhe, topping hen xao thom ngon.', 3.5, 1, 'http://localhost:8080/uploads/product-images/d0d057ac-d2a1-4edd-be68-fc3758592166.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T18:53:35.270'),
(10, 4, 3, 'Cơm Gà Hội An', 'Com ga Hoi An noi tieng, gao vang nghe va nuoc cham cay.', 4.5, 1, 'http://localhost:8080/uploads/product-images/97d7c395-c9fd-4889-90f4-b387b1022845.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T18:54:12.910'),
(11, 4, 3, 'Cơm Sườn', 'Com suon nuong thom lung, an kem canh va dua leo.', 4, 1, 'http://localhost:8080/uploads/product-images/12ab4828-0801-44b5-afc0-f82cf7348b74.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T18:55:16.970'),
(12, 4, 3, 'Cơm Cá Kho', 'Com ca kho dam da, nau theo phong cach gia dinh.', 4.2, 1, 'http://localhost:8080/uploads/product-images/70c908ae-f941-4f87-8e3d-7a94bbcd91d4.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T18:56:51.300'),
(13, 4, 3, 'Cơm Thịt Kho', 'Com thit kho trung beo ngay, huong vi truyen thong.', 3.8, 1, 'http://localhost:8080/uploads/product-images/f67a785e-3676-42dd-906b-66deccb4a868.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T18:57:23.490'),
(14, 4, 2, 'Bánh Mì Gà Xé', 'Banh mi ga xe an kem do chua, phu hop bua sang.', 3, 1, 'http://localhost:8080/uploads/product-images/0a1ef7fd-5318-46bd-9cc9-b8cb754456a5.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T18:57:56.253'),
(15, 5, 1, 'Bún Chả Cá', 'Bun cha ca Da Nang noi tieng, nuoc dung ca chua thanh ngot.', 4, 1, 'http://localhost:8080/uploads/product-images/b78ecd3f-3089-470d-99d3-edc8aecb7bc9.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T18:58:34.390'),
(16, 5, 1, 'Bún Riêu', 'Bun rieu cua, dau hu va rau thom.', 3.8, 1, 'http://localhost:8080/uploads/product-images/66cc71f2-047d-4d4f-9954-147ef5b5d1c1.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T18:59:37.653'),
(17, 5, 3, 'Cơm Cá Chiên', 'Com ca chien gion voi nuoc mam chanh ot.', 4.2, 1, 'http://localhost:8080/uploads/product-images/16c14da9-763c-4443-aa75-ea8aa802e988.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T19:00:26.173'),
(18, 5, 3, 'Cơm Tôm Rim', 'Com tom rim dam vi, tom tuoi rim man ngot.', 4.5, 1, 'http://localhost:8080/uploads/product-images/cbbaff4f-0f26-4856-9135-cf1fbb79dcb7.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T19:01:36.106'),
(19, 5, 3, 'Cơm Bò Lúc Lắc', 'Com bo luc lac, an kem trung op la va salad.', 5, 1, 'http://localhost:8080/uploads/product-images/aa8ba17a-5213-4de8-98f1-5ac362d66f85.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T19:02:29.070'),
(20, 6, 2, 'Pizza Margherita', 'Pizza Margherita truyen thong voi ca chua, pho mai mozzarella va hung que.', 6.5, 1, 'http://localhost:8080/uploads/product-images/f1bf4a36-b61c-4b17-aeac-3e16698ad1da.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T19:02:56.953'),
(21, 6, 2, 'Pizza Hawaiian', 'Pizza Hawaiian voi giam bong va dua, vi ngot nhe.', 7, 1, 'http://localhost:8080/uploads/product-images/10bd41c7-eac7-4a96-a3e2-ab5b82e81c24.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T19:03:30.606'),
(22, 6, 2, 'Pizza Pepperoni', 'Pizza Pepperoni cay nhe, pho mai tan chay.', 7.5, 1, 'http://localhost:8080/uploads/product-images/fb4aee94-a88c-4a99-9407-93982a2c1566.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T19:04:02.950'),
(23, 6, 3, 'Cơm Bò Nướng', 'Com bo nuong voi salad tuoi va nuoc sot dac biet.', 5.5, 1, 'http://localhost:8080/uploads/product-images/242db6b1-0ab4-49e2-b3ff-ab38e544805d.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T19:04:49.953'),
(24, 6, 3, 'Cơm Gà Nướng', 'Com ga nuong thom lung, an kem dua leo va trung.', 5, 1, 'http://localhost:8080/uploads/product-images/365d7b1a-45f7-4b75-9cb9-bf2f1fea759c.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T19:05:41.750'),
(25, 7, 2, 'Bánh Mì Pate', 'Banh mi pate gion, nhan pate va dua leo.', 2.5, 1, 'http://localhost:8080/uploads/product-images/40ecf903-27e1-4c6a-b9c4-2acd6860aeb4.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T19:06:32.433'),
(26, 7, 2, 'Bánh Mì Trứng', 'Banh mi trung chien, mon sang quen thuoc cua nguoi Viet.', 2.8, 1, 'http://localhost:8080/uploads/product-images/03f8a199-34ff-40fa-b9f2-92b5a74182a8.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T19:07:10.393'),
(27, 7, 3, 'Cơm Tấm Bì', 'Com tam bi voi thit nuong va trung.', 4, 1, 'http://localhost:8080/uploads/product-images/a0bc5b00-a161-41a5-bfdf-17722f0f87b2.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T19:07:57.363'),
(28, 7, 1, 'Phở Tái', 'Pho tai bo tuoi, nuoc dung trong ngot thanh.', 5, 1, 'http://localhost:8080/uploads/product-images/b81cc1e5-03f7-4fd4-8aeb-1622ba9c2dcf.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T19:08:30.593'),
(29, 7, 1, 'Phở Hải Sản', 'Pho hai san voi tom va muc tuoi.', 5.5, 1, 'http://localhost:8080/uploads/product-images/fb6f5e0e-3e88-418c-b8d0-2f500d37d15c.png', 'active', '2025-10-09T07:20:20.846', '2025-10-09T19:08:49.646'),
(30, 7, 4, 'Cà Phê Sữa Đá', 'Ca phe sua da dam vi Viet Nam, pha phin truyen thong.', 2.5, 1, 'http://localhost:8080/uploads/product-images/c9aee168-a10c-42bb-820b-d47144c84e95.png', 'active', '2025-10-09T07:43:05.723', '2025-10-09T19:09:13.136'),
(31, 7, 4, 'Trà Đào Cam Sả', 'Tra dao cam sa tuoi mat, huong thom diu nhe.', 3, 1, 'http://localhost:8080/uploads/product-images/61693157-d9f5-45f8-b120-623d6f72d21a.png', 'active', '2025-10-09T07:43:05.723', '2025-10-09T19:09:31.966'),
(32, 7, 4, 'Sinh Tố Bơ', 'Sinh to bo beo ngay, xay cung sua dac.', 3.5, 1, 'http://localhost:8080/uploads/product-images/246cde1d-e181-47f0-b90b-7ab194e551fc.png', 'active', '2025-10-09T07:43:05.723', '2025-10-09T19:10:22.893'),
(33, 7, 4, 'Nước Ép Dưa Hấu', 'Nuoc ep dua hau tuoi, khong them duong.', 3, 1, 'http://localhost:8080/uploads/product-images/f8d20c7e-3473-4bf8-9167-cab581e8fbe0.png', 'active', '2025-10-09T07:43:05.723', '2025-10-09T19:11:11.863'),
(34, 7, 4, 'Matcha Latte', 'Matcha latte mat lanh, lop sua beo min.', 3.8, 1, 'http://localhost:8080/uploads/product-images/67ec3246-5620-4b75-8b8f-749deb8389af.png', 'active', '2025-10-09T07:43:05.723', '2025-10-09T19:11:16.226');
SET IDENTITY_INSERT [dbo].[products] OFF;
GO
SET IDENTITY_INSERT [dbo].[vouchers] ON;
INSERT INTO [dbo].[vouchers] ([id], [code], [discount_type], [discount_value], [min_order_value], [expiry_date], [max_uses], [used_count], [created_by], [created_at], [is_active]) VALUES
(1, '1223ABD', 'percentage', 10.00, 20.00, '2025-12-31', 100, 0, 1, '2025-09-30T19:54:50.186', 1),
(2, '4567EFG', 'percentage', 15.00, 15.00, '2025-12-31', 100, 0, 1, '2025-09-30T19:54:50.190', 1),
(3, '89HIJK0', 'fixed', 5.00, 10.00, '2025-12-31', 100, 0, 1, '2025-09-30T19:54:50.190', 1);
SET IDENTITY_INSERT [dbo].[vouchers] OFF;
GO
SET IDENTITY_INSERT [dbo].[delivery_addresses] ON;
INSERT INTO [dbo].[delivery_addresses] ([id], [user_id], [address_name], [full_address], [phone], [is_default], [created_at]) VALUES
(1, 4, 'Home', '123 Buyer St, Hanoi', '0490659980', 1, '2025-09-30T19:54:50.160'),
(2, 5, 'Office', '456 Buyer Ave, Saigon', '0492142740', 1, '2025-09-30T19:54:50.160'),
(3, 20, 'Home', '15 Lê Duẩn, Hải Châu, Đà Nẵng', '0123456789', 1, '2025-10-28T23:47:10.810'),
(4, 17, 'Nhà riêng 1', '123 Nguyễn Văn Linh, Đà Nẵng', '0901234567', 0, '2025-11-05T00:05:48.470'),
(5, 17, 'Nhà riêng 2', '456 Lê Duẩn, Đà Nẵng', '0901234568', 0, '2025-11-05T00:05:48.470');
SET IDENTITY_INSERT [dbo].[delivery_addresses] OFF;
GO
SET IDENTITY_INSERT [dbo].[orders] ON;
INSERT INTO [dbo].[orders] ([id], [buyer_id], [shop_id], [delivery_address_id], [total_amount], [status], [voucher_id], [notes], [created_at], [recipient_name], [recipient_phone], [address_text], [latitude], [longitude]) VALUES
(1, 4, 1, 1, 10.00, 'delivered', 1, 'Extra spicy', '2025-09-30T19:54:50.203', 'Buyer One', '0127363062', '123 Buyer St, Hanoi', 21.028500, 105.854200),
(2, 5, 2, 2, 7.00, 'confirmed', 2, NULL, '2025-09-30T19:54:50.203', 'Buyer Two', '0150651604', '456 Buyer Ave, Saigon', 10.823100, 106.629700),
(3, 17, 7, 4, 150000.0000, 'confirmed', NULL, 'Giao giờ hành chính', '2025-11-05T00:05:48.470', 'Khách Hàng Test 1', '0901234567', '123 Nguyễn Văn Linh, Đà Nẵng', NULL, NULL);
SET IDENTITY_INSERT [dbo].[orders] OFF;
GO
SET IDENTITY_INSERT [dbo].[order_items] ON;
INSERT INTO [dbo].[order_items] ([id], [order_id], [product_id], [quantity], [unit_price]) VALUES
(1, 1, 1, 2, 5.00),
(2, 2, 3, 1, 3.00),
(3, 2, 4, 1, 4.00);
SET IDENTITY_INSERT [dbo].[order_items] OFF;
GO
SET IDENTITY_INSERT [dbo].[carts] ON;
INSERT INTO [dbo].[carts] ([id], [created_at], [updated_at], [user_id]) VALUES 
(1, '2025-10-25T10:20:36.065', '2025-10-25T12:25:50.257', 19);
SET IDENTITY_INSERT [dbo].[carts] OFF;
GO
SET IDENTITY_INSERT [dbo].[cart_items] ON;
INSERT INTO [dbo].[cart_items] ([id], [created_at], [price], [product_id], [quantity], [cart_id]) VALUES 
(1, '2025-10-25T10:20:36.172', 150000.00, 30, 2, 1),
(2, '2025-10-25T12:19:04.990', 35000.00, 1, 1, 1);
SET IDENTITY_INSERT [dbo].[cart_items] OFF;
GO
SET IDENTITY_INSERT [dbo].[chats] ON;
INSERT INTO [dbo].[chats] ([id], [order_id], [buyer_id], [seller_id], [is_bot], [created_at]) VALUES 
(1, 1, 4, 2, 0, '2025-09-30T19:54:50.263');
SET IDENTITY_INSERT [dbo].[chats] OFF;
GO
SET IDENTITY_INSERT [dbo].[deliveries] ON;
INSERT INTO [dbo].[deliveries] ([id], [order_id], [shipper_id], [status], [tracking_code], [delivered_at], [created_at]) VALUES 
(1, 1, 6, 'delivered', 'TRACK001', '2025-10-01T10:00:00.000', '2025-09-30T19:54:50.233'),
(2, 2, 6, 'in_transit', 'TRACK002', NULL, '2025-09-30T19:54:50.233');
SET IDENTITY_INSERT [dbo].[deliveries] OFF;
GO
INSERT INTO complaint_categories (category_code, category_name_vi, category_name_en, description) VALUES
('product_quality', N'Chất lượng sản phẩm', 'Product Quality', N'Sản phẩm không đúng mô tả, hỏng hóc'),
('delivery_issue', N'Vấn đề giao hàng', 'Delivery Issue', N'Giao hàng chậm, shipper thái độ không tốt'),
('seller_service', N'Dịch vụ người bán', 'Seller Service', N'Người bán hỗ trợ kém, thái độ không tốt'),
('shipper_service', N'Dịch vụ shipper', 'Shipper Service', N'Shipper giao hàng không đúng, thái độ xấu'),
('payment_issue', N'Vấn đề thanh toán', 'Payment Issue', N'Sai số tiền, chưa nhận tiền hoàn'),
('account_ban', N'Khiếu nại khóa tài khoản', 'Account Ban Appeal', N'Tài khoản bị khóa oan, yêu cầu mở lại'),
('fraud_scam', N'Lừa đảo', 'Fraud/Scam', N'Nghi ngờ gian lận, lừa đảo'),
('other', N'Khác', 'Other', N'Vấn đề khác');
GO

-- =============================================
-- Constraints and Indexes
-- =============================================
ALTER TABLE [dbo].[users] ADD CONSTRAINT UQ_users_email UNIQUE NONCLUSTERED ([email] ASC);
GO
ALTER TABLE [dbo].[shops] ADD UNIQUE NONCLUSTERED ([seller_id] ASC);
GO
ALTER TABLE [dbo].[vouchers] ADD UNIQUE NONCLUSTERED ([code] ASC);
GO
ALTER TABLE [dbo].[deliveries] ADD UNIQUE NONCLUSTERED ([order_id] ASC);
GO
ALTER TABLE [dbo].[favorites] ADD CONSTRAINT [UQ_fav_user_product] UNIQUE NONCLUSTERED ([user_id] ASC, [product_id] ASC);
GO
-- Foreign Keys
ALTER TABLE [dbo].[shops] WITH CHECK ADD FOREIGN KEY([seller_id]) REFERENCES [dbo].[users] ([id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[products] WITH CHECK ADD FOREIGN KEY([shop_id]) REFERENCES [dbo].[shops] ([id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[products] WITH NOCHECK ADD FOREIGN KEY([category_id]) REFERENCES [dbo].[categories] ([id]);
GO
ALTER TABLE [dbo].[orders] WITH CHECK ADD FOREIGN KEY([buyer_id]) REFERENCES [dbo].[users] ([id]);
GO
ALTER TABLE [dbo].[orders] WITH CHECK ADD FOREIGN KEY([delivery_address_id]) REFERENCES [dbo].[delivery_addresses] ([id]);
GO
ALTER TABLE [dbo].[orders] WITH CHECK ADD FOREIGN KEY([shop_id]) REFERENCES [dbo].[shops] ([id]); -- Removed ON DELETE CASCADE to prevent cycles
GO
ALTER TABLE [dbo].[orders] WITH CHECK ADD FOREIGN KEY([voucher_id]) REFERENCES [dbo].[vouchers] ([id]) ON DELETE SET NULL;
GO
ALTER TABLE [dbo].[order_items] WITH CHECK ADD FOREIGN KEY([order_id]) REFERENCES [dbo].[orders] ([id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[order_items] WITH CHECK ADD FOREIGN KEY([product_id]) REFERENCES [dbo].[products] ([id]);
GO
ALTER TABLE [dbo].[cart_items]  WITH CHECK ADD FOREIGN KEY([cart_id]) REFERENCES [dbo].[carts] ([id]);
GO
ALTER TABLE [dbo].[chats]  WITH CHECK ADD FOREIGN KEY([buyer_id]) REFERENCES [dbo].[users] ([id]);
GO
ALTER TABLE [dbo].[chats]  WITH CHECK ADD FOREIGN KEY([order_id]) REFERENCES [dbo].[orders] ([id]) ON DELETE SET NULL;
GO
ALTER TABLE [dbo].[chats]  WITH CHECK ADD FOREIGN KEY([seller_id]) REFERENCES [dbo].[users] ([id]);
GO
ALTER TABLE [dbo].[deliveries]  WITH CHECK ADD FOREIGN KEY([order_id]) REFERENCES [dbo].[orders] ([id]);
GO
ALTER TABLE [dbo].[deliveries]  WITH CHECK ADD FOREIGN KEY([shipper_id]) REFERENCES [dbo].[users] ([id]) ON DELETE SET NULL;
GO
ALTER TABLE [dbo].[delivery_addresses]  WITH CHECK ADD FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([id]);
GO
ALTER TABLE [dbo].[delivery_zones]  WITH CHECK ADD FOREIGN KEY([shop_id]) REFERENCES [dbo].[shops] ([id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[messages]  WITH CHECK ADD FOREIGN KEY([chat_id]) REFERENCES [dbo].[chats] ([id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[messages]  WITH CHECK ADD FOREIGN KEY([sender_id]) REFERENCES [dbo].[users] ([id]) ON DELETE SET NULL;
GO
ALTER TABLE [dbo].[notifications]  WITH CHECK ADD FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([id]);
GO
ALTER TABLE [dbo].[order_status_history]  WITH CHECK ADD FOREIGN KEY([changed_by]) REFERENCES [dbo].[users] ([id]);
GO
ALTER TABLE [dbo].[order_status_history]  WITH CHECK ADD FOREIGN KEY([order_id]) REFERENCES [dbo].[orders] ([id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[payments]  WITH CHECK ADD FOREIGN KEY([order_id]) REFERENCES [dbo].[orders] ([id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[payments]  WITH CHECK ADD FOREIGN KEY([payment_method_id]) REFERENCES [dbo].[payment_methods] ([id]);
GO
ALTER TABLE [dbo].[reviews]  WITH CHECK ADD FOREIGN KEY([order_id]) REFERENCES [dbo].[orders] ([id]);
GO
ALTER TABLE [dbo].[reviews]  WITH CHECK ADD FOREIGN KEY([product_id]) REFERENCES [dbo].[products] ([id]);
GO
ALTER TABLE [dbo].[reviews]  WITH CHECK ADD FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([id]);
GO
ALTER TABLE [dbo].[shop_reviews]  WITH CHECK ADD FOREIGN KEY([order_id]) REFERENCES [dbo].[orders] ([id]);
GO
ALTER TABLE [dbo].[shop_reviews]  WITH CHECK ADD FOREIGN KEY([shop_id]) REFERENCES [dbo].[shops] ([id]);
GO
ALTER TABLE [dbo].[shop_reviews]  WITH CHECK ADD FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([id]);
GO
ALTER TABLE [dbo].[vouchers]  WITH CHECK ADD FOREIGN KEY([created_by]) REFERENCES [dbo].[users] ([id]);
GO
ALTER TABLE [dbo].[role_applications]  WITH CHECK ADD FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([id]);
GO
ALTER TABLE [dbo].[role_applications]  WITH CHECK ADD FOREIGN KEY([reviewed_by]) REFERENCES [dbo].[users] ([id]);
GO
ALTER TABLE [dbo].[user_vouchers]  WITH CHECK ADD FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([id]);
GO
ALTER TABLE [dbo].[user_vouchers]  WITH CHECK ADD FOREIGN KEY([voucher_id]) REFERENCES [dbo].[vouchers] ([id]);
GO
ALTER TABLE [dbo].[user_vouchers]  WITH CHECK ADD FOREIGN KEY([order_id]) REFERENCES [dbo].[orders] ([id]) ON DELETE SET NULL;
GO
ALTER TABLE [dbo].[favorites]  WITH CHECK ADD FOREIGN KEY([product_id]) REFERENCES [dbo].[products] ([id]);
GO
ALTER TABLE [dbo].[favorites]  WITH CHECK ADD FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([id]) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[shippers]  WITH CHECK ADD FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([id]);
GO
ALTER TABLE [dbo].[complaints] WITH CHECK ADD FOREIGN KEY (complainant_id) REFERENCES users(id);
GO
ALTER TABLE [dbo].[complaints] WITH CHECK ADD FOREIGN KEY (respondent_id) REFERENCES users(id);
GO
ALTER TABLE [dbo].[complaints] WITH CHECK ADD FOREIGN KEY (assigned_admin_id) REFERENCES users(id);
GO
ALTER TABLE [dbo].[complaint_images] WITH CHECK ADD FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[complaint_responses] WITH CHECK ADD FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE;
GO
ALTER TABLE [dbo].[complaint_responses] WITH CHECK ADD FOREIGN KEY (user_id) REFERENCES users(id);
GO
-- Check Constraints
ALTER TABLE [dbo].[users] ADD CONSTRAINT [CK_users_status] CHECK (status IN ('ACTIVE', 'BANNED', 'SUSPENDED', 'PENDING'));
GO
ALTER TABLE [dbo].[users] ADD CONSTRAINT [CK_users_role] CHECK (([role]='shipper' OR [role]='admin' OR [role]='seller' OR [role]='buyer' OR [role]='SHIPPER'));
GO
ALTER TABLE [dbo].[products] ADD CONSTRAINT [CK_products_approval_status] CHECK (approval_status IN ('pending', 'approved', 'rejected'));
GO
ALTER TABLE [dbo].[products] ADD CONSTRAINT [CK_products_status] CHECK (([status]='out_of_stock' OR [status]='inactive' OR [status]='active'));
GO
ALTER TABLE [dbo].[deliveries] ADD CONSTRAINT [CK_deliveries_status] CHECK (([status]='failed' OR [status]='delivered' OR [status]='in_transit' OR [status]='picked_up' OR [status]='assigned'));
GO
ALTER TABLE [dbo].[notifications] ADD CONSTRAINT [CK_notifications_type] CHECK (([type]='admin_message' OR [type]='promotion' OR [type]='order_update'));
GO
ALTER TABLE [dbo].[orders] ADD CONSTRAINT [CK_orders_status] CHECK (([status]='cancelled' OR [status]='delivered' OR [status]='shipping' OR [status]='preparing' OR [status]='confirmed' OR [status]='pending'));
GO
ALTER TABLE [dbo].[payments] ADD CONSTRAINT [CK_payments_status] CHECK (([status]='refunded' OR [status]='cancelled' OR [status]='failed' OR [status]='completed' OR [status]='pending'));
GO
ALTER TABLE [dbo].[role_applications] ADD CONSTRAINT [CK_role_applications_status] CHECK (([status]='rejected' OR [status]='approved' OR [status]='pending'));
GO
ALTER TABLE [dbo].[role_applications] ADD CONSTRAINT [CK_role_applications_requested_role] CHECK (([requested_role]='shipper' OR [requested_role]='seller'));
GO
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT [CK_reviews_rating] CHECK (([rating]>=(1) AND [rating]<=(5)));
GO
ALTER TABLE [dbo].[shop_reviews] ADD CONSTRAINT [CK_shop_reviews_rating] CHECK (([rating]>=(1) AND [rating]<=(5)));
GO
ALTER TABLE [dbo].[verification_codes] ADD CONSTRAINT [CK_verification_codes_type] CHECK (([type]='PASSWORD_RESET' OR [type]='EMAIL_VERIFICATION'));
GO
ALTER TABLE [dbo].[vouchers] ADD CONSTRAINT [CK_vouchers_discount_type] CHECK (([discount_type]='fixed' OR [discount_type]='percentage'));
GO
-- Indexes for performance
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_complainant ON complaints(complainant_id);
CREATE INDEX idx_complaints_respondent ON complaints(respondent_id);
CREATE INDEX idx_complaints_created ON complaints(created_at DESC);
CREATE INDEX idx_complaint_images_complaint ON complaint_images(complaint_id);
CREATE INDEX idx_complaint_responses_complaint ON complaint_responses(complaint_id);
GO

-- =============================================
-- Stored Procedures, Functions, and Triggers
-- =============================================
CREATE FUNCTION dbo.fn_is_admin(@user_id INT)
RETURNS BIT
AS BEGIN
    RETURN (SELECT IIF(EXISTS(SELECT 1 FROM dbo.users WHERE id = @user_id AND role = 'admin' AND deleted_at IS NULL AND ISNULL(is_banned, 0) = 0), 1, 0));
END;
GO
CREATE PROCEDURE dbo.sp_admin_update_user @admin_id INT, @user_id INT, @full_name NVARCHAR(255) = NULL, @role NVARCHAR(20) = NULL
AS BEGIN
    SET NOCOUNT ON;
    IF dbo.fn_is_admin(@admin_id) = 0 THROW 50010, 'Only admin can update users.', 1;
    UPDATE dbo.users SET full_name = COALESCE(@full_name, full_name), role = COALESCE(@role, role), updated_at = GETDATE() WHERE id = @user_id;
END;
GO
CREATE FUNCTION dbo.GenerateComplaintNumber()
RETURNS VARCHAR(20)
AS BEGIN
    DECLARE @date_str VARCHAR(8) = CONVERT(VARCHAR(8), GETDATE(), 112);
    DECLARE @next_id INT = (SELECT ISNULL(COUNT(*), 0) + 1 FROM complaints WHERE CONVERT(DATE, created_at) = CONVERT(DATE, GETDATE()));
    RETURN 'CPL-' + @date_str + '-' + RIGHT('00000' + CAST(@next_id AS VARCHAR(5)), 5);
END;
GO
CREATE TRIGGER trg_GenerateComplaintNumber ON complaints
AFTER INSERT
AS BEGIN
    SET NOCOUNT ON;
    UPDATE c SET complaint_number = dbo.GenerateComplaintNumber() FROM complaints c JOIN inserted i ON c.id = i.id WHERE i.complaint_number IS NULL;
END;
GO
PRINT '====== MERGE SCRIPT WITH FULL DATA COMPLETED SUCCESSFULLY ======'
GO