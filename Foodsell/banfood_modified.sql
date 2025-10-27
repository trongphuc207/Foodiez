USE [food_delivery_db6]
GO
/****** Object:  Table [dbo].[categories]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[categories](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[chats]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[chats](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NULL,
	[buyer_id] [int] NOT NULL,
	[seller_id] [int] NULL,
	[is_bot] [bit] NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[deliveries]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[deliveries](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NOT NULL,
	[shipper_id] [int] NULL,
	[status] [nvarchar](20) NULL,
	[tracking_code] [nvarchar](100) NULL,
	[delivered_at] [datetime2](7) NULL,
	[failure_reason] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[delivery_addresses]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[delivery_addresses](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[address_name] [nvarchar](100) NOT NULL,
	[full_address] [nvarchar](max) NOT NULL,
	[phone] [nvarchar](20) NULL,
	[is_default] [bit] NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[delivery_zones]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[delivery_zones](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[shop_id] [int] NOT NULL,
	[zone_name] [nvarchar](100) NOT NULL,
	[delivery_fee] [decimal](10, 2) NOT NULL,
	[min_order_value] [decimal](10, 2) NULL,
	[estimated_time] [int] NOT NULL,
	[is_active] [bit] NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[messages]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[messages](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[chat_id] [int] NOT NULL,
	[sender_id] [int] NULL,
	[message] [nvarchar](max) NOT NULL,
	[is_bot] [bit] NULL,
	[timestamp] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[notifications]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[notifications](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[type] [nvarchar](20) NOT NULL,
	[title] [nvarchar](255) NULL,
	[message] [nvarchar](max) NOT NULL,
	[is_read] [bit] NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[order_items]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[order_items](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NOT NULL,
	[product_id] [int] NOT NULL,
	[quantity] [int] NOT NULL,
	[unit_price] [decimal](10, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[order_status_history]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[order_status_history](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NOT NULL,
	[status] [nvarchar](20) NOT NULL,
	[notes] [nvarchar](max) NULL,
	[changed_by] [int] NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[orders]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[payment_methods]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[payment_methods](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](100) NOT NULL,
	[description] [nvarchar](max) NULL,
	[is_active] [bit] NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[payments]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[payments](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NOT NULL,
	[payment_method_id] [int] NOT NULL,
	[amount] [decimal](10, 2) NOT NULL,
	[status] [nvarchar](20) NULL,
	[transaction_id] [nvarchar](255) NULL,
	[payment_date] [datetime2](7) NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[products]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[reviews] - MODIFIED FOR HIBERNATE ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
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
/****** Object:  Table [dbo].[review_replies] - NEW TABLE FOR HIBERNATE ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
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
/****** Object:  Table [dbo].[shops] - MODIFIED RATING TYPE ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
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
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[users]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
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
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[verification_codes]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[verification_codes](
	[id] [bigint] IDENTITY(1,1) NOT NULL,
	[code] [varchar](255) NOT NULL,
	[created_at] [datetime2](6) NOT NULL,
	[email] [varchar](255) NOT NULL,
	[expires_at] [datetime2](6) NOT NULL,
	[is_used] [bit] NOT NULL,
	[type] [varchar](255) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[vouchers]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[vouchers](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[code] [nvarchar](50) NOT NULL,
	[discount_type] [nvarchar](20) NOT NULL,
	[discount_value] [decimal](5, 2) NOT NULL,
	[min_order_value] [decimal](10, 2) NULL,
	[expiry_date] [date] NOT NULL,
	[max_uses] [int] NULL,
	[used_count] [int] NULL,
	[created_by] [int] NOT NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

-- INSERT DATA (same as original banfood.sql)
SET IDENTITY_INSERT [dbo].[categories] ON 
INSERT [dbo].[categories] ([id], [name], [description], [created_at]) VALUES (1, N'Phở', N'Vietnamese noodle soup, ready-to-eat', CAST(N'2025-09-30T19:54:50.1633333' AS DateTime2))
INSERT [dbo].[categories] ([id], [name], [description], [created_at]) VALUES (2, N'Bánh Mì', N'Vietnamese sandwich, ready-to-eat', CAST(N'2025-09-30T19:54:50.1633333' AS DateTime2))
INSERT [dbo].[categories] ([id], [name], [description], [created_at]) VALUES (3, N'Cơm', N'Rice dishes, ready-to-eat', CAST(N'2025-09-30T19:54:50.1633333' AS DateTime2))
INSERT [dbo].[categories] ([id], [name], [description], [created_at]) VALUES (4, N'Nước uống', N'Beverages including coffee, tea, and soft drinks', CAST(N'2025-10-09T07:32:55.2700000' AS DateTime2))
INSERT [dbo].[categories] ([id], [name], [description], [created_at]) VALUES (5, N'Pizza', N'Món pizza phong cách Ý, nhiều loại topping đa dạng.', CAST(N'2025-10-10T15:57:31.6000000' AS DateTime2))
INSERT [dbo].[categories] ([id], [name], [description], [created_at]) VALUES (6, N'Bún', N'Món bún Việt Nam truyền thống, dùng với thịt, chả hoặc hải sản.', CAST(N'2025-10-10T15:57:31.6000000' AS DateTime2))
SET IDENTITY_INSERT [dbo].[categories] OFF
GO

-- Insert sample reviews data (migrated from original reviews + shop_reviews)
INSERT INTO [dbo].[reviews] ([customer_id], [product_id], [shop_id], [order_id], [rating], [content], [is_visible], [created_at], [updated_at])
VALUES 
(4, 1, 1, 1, 5, N'Delicious ready-to-eat Pho!', 1, CAST(N'2025-09-30T19:54:50.2500000' AS DateTime2), CAST(N'2025-09-30T19:54:50.2500000' AS DateTime2)),
(4, -1, 1, 1, 4, N'Good service and fast delivery', 1, CAST(N'2025-09-30T19:54:50.2533333' AS DateTime2), CAST(N'2025-09-30T19:54:50.2533333' AS DateTime2));

-- Continue with all other INSERT statements from original banfood.sql...
-- (Copy all INSERT statements from your original file here)

SET IDENTITY_INSERT [dbo].[users] ON 
INSERT [dbo].[users] ([id], [email], [password_hash], [full_name], [phone], [address], [role], [is_verified], [created_at], [updated_at], [deleted_at], [reset_token], [reset_token_expiry], [profile_image], [verification_token], [verification_token_expiry]) VALUES (1, N'admin@example.com', N'hashedpass', N'Admin User', N'0500034420', N'123 Hanoi St, Hanoi', N'admin', 1, CAST(N'2025-09-30T19:54:50.1400000' AS DateTime2), CAST(N'2025-09-30T19:54:50.1400000' AS DateTime2), NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[users] ([id], [email], [password_hash], [full_name], [phone], [address], [role], [is_verified], [created_at], [updated_at], [deleted_at], [reset_token], [reset_token_expiry], [profile_image], [verification_token], [verification_token_expiry]) VALUES (2, N'seller1@example.com', N'hashedpass', N'Seller One', N'0405451545', N'456 Saigon Ave, Ho Chi Minh City', N'seller', 1, CAST(N'2025-09-30T19:54:50.1433333' AS DateTime2), CAST(N'2025-09-30T19:54:50.1433333' AS DateTime2), NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[users] ([id], [email], [password_hash], [full_name], [phone], [address], [role], [is_verified], [created_at], [updated_at], [deleted_at], [reset_token], [reset_token_expiry], [profile_image], [verification_token], [verification_token_expiry]) VALUES (3, N'seller2@example.com', N'hashedpass', N'Seller Two', N'0875227972', N'456 Saigon Ave, Ho Chi Minh City', N'seller', 1, CAST(N'2025-09-30T19:54:50.1433333' AS DateTime2), CAST(N'2025-09-30T19:54:50.1433333' AS DateTime2), NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[users] ([id], [email], [password_hash], [full_name], [phone], [address], [role], [is_verified], [created_at], [updated_at], [deleted_at], [reset_token], [reset_token_expiry], [profile_image], [verification_token], [verification_token_expiry]) VALUES (4, N'buyer1@example.com', N'hashedpass', N'Buyer One', N'0465432660', N'123 Hanoi St, Hanoi', N'buyer', 1, CAST(N'2025-09-30T19:54:50.1433333' AS DateTime2), CAST(N'2025-09-30T19:54:50.1433333' AS DateTime2), NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[users] ([id], [email], [password_hash], [full_name], [phone], [address], [role], [is_verified], [created_at], [updated_at], [deleted_at], [reset_token], [reset_token_expiry], [profile_image], [verification_token], [verification_token_expiry]) VALUES (5, N'buyer2@example.com', N'hashedpass', N'Buyer Two', N'0619812714', N'123 Hanoi St, Hanoi', N'buyer', 1, CAST(N'2025-09-30T19:54:50.1433333' AS DateTime2), CAST(N'2025-09-30T19:54:50.1433333' AS DateTime2), NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[users] ([id], [email], [password_hash], [full_name], [phone], [address], [role], [is_verified], [created_at], [updated_at], [deleted_at], [reset_token], [reset_token_expiry], [profile_image], [verification_token], [verification_token_expiry]) VALUES (6, N'shipper1@example.com', N'hashedpass', N'Shipper One', N'0390633094', N'789 Da Nang Blvd, Da Nang', N'shipper', 1, CAST(N'2025-09-30T19:54:50.1433333' AS DateTime2), CAST(N'2025-09-30T19:54:50.1433333' AS DateTime2), NULL, NULL, NULL, NULL, NULL, NULL)
INSERT [dbo].[users] ([id], [email], [password_hash], [full_name], [phone], [address], [role], [is_verified], [created_at], [updated_at], [deleted_at], [reset_token], [reset_token_expiry], [profile_image], [verification_token], [verification_token_expiry]) VALUES (7, N'trongphuc20704@gmail.com', N'9e8b9dc5ee1b3a93e090a867254974bbe40a4a4d6e6d9192914167ef4f8b6ff2', N'Trong Phuc', N'0778956030', N'Da Nang', N'buyer', 1, CAST(N'2025-10-01T23:19:04.3008510' AS DateTime2), CAST(N'2025-10-08T07:52:10.9833333' AS DateTime2), NULL, NULL, NULL, N'http://localhost:8080/uploads/profile-images/1ac9e0d6-4389-4cd6-8423-9dfda6a7c62c.png', NULL, NULL)
INSERT [dbo].[users] ([id], [email], [password_hash], [full_name], [phone], [address], [role], [is_verified], [created_at], [updated_at], [deleted_at], [reset_token], [reset_token_expiry], [profile_image], [verification_token], [verification_token_expiry]) VALUES (8, N'phuclt207@gmail.com', N'9e8b9dc5ee1b3a93e090a867254974bbe40a4a4d6e6d9192914167ef4f8b6ff2', N'Phuc', N'', N'Viet Nam', N'buyer', 0, CAST(N'2025-10-01T23:34:32.5539330' AS DateTime2), CAST(N'2025-10-01T23:34:32.5539330' AS DateTime2), NULL, NULL, NULL, NULL, NULL, NULL)
SET IDENTITY_INSERT [dbo].[users] OFF
GO

-- Add all other INSERT statements from your original banfood.sql here...
-- (shops, products, orders, etc.)

-- Add constraints and indexes
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT FK_reviews_customer FOREIGN KEY ([customer_id]) REFERENCES [dbo].[users] ([id])
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT FK_reviews_product FOREIGN KEY ([product_id]) REFERENCES [dbo].[products] ([id])
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT FK_reviews_shop FOREIGN KEY ([shop_id]) REFERENCES [dbo].[shops] ([id])
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT FK_reviews_order FOREIGN KEY ([order_id]) REFERENCES [dbo].[orders] ([id])
ALTER TABLE [dbo].[review_replies] ADD CONSTRAINT FK_review_replies_review FOREIGN KEY ([review_id]) REFERENCES [dbo].[reviews] ([id]) ON DELETE CASCADE
ALTER TABLE [dbo].[review_replies] ADD CONSTRAINT FK_review_replies_merchant FOREIGN KEY ([merchant_id]) REFERENCES [dbo].[users] ([id])
ALTER TABLE [dbo].[reviews] ADD CONSTRAINT CK_reviews_rating CHECK ([rating] >= 1 AND [rating] <= 5)

-- Add all other constraints from original banfood.sql...

PRINT '=== HOÀN THÀNH SETUP DATABASE ===';
PRINT 'Database đã được setup với schema tương thích Hibernate!';
