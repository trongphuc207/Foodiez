
ALTER SERVER ROLE sysadmin ADD MEMBER sa;
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
/****** Object:  Table [dbo].[reviews]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[reviews](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NULL,
	[product_id] [int] NOT NULL,
	[user_id] [int] NOT NULL,
	[rating] [int] NULL,
	[comment] [nvarchar](max) NULL,
	[image_url] [nvarchar](500) NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[shop_reviews]    Script Date: 10/11/2025 10:36:52 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[shop_reviews](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[order_id] [int] NULL,
	[shop_id] [int] NOT NULL,
	[user_id] [int] NOT NULL,
	[rating] [int] NULL,
	[comment] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[shops]    Script Date: 10/11/2025 10:36:52 AM ******/
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
	[rating] [decimal](3, 2) NULL,
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
SET IDENTITY_INSERT [dbo].[categories] ON 

INSERT [dbo].[categories] ([id], [name], [description], [created_at]) VALUES (1, N'Phở', N'Vietnamese noodle soup, ready-to-eat', CAST(N'2025-09-30T19:54:50.1633333' AS DateTime2))
INSERT [dbo].[categories] ([id], [name], [description], [created_at]) VALUES (2, N'Bánh Mì', N'Vietnamese sandwich, ready-to-eat', CAST(N'2025-09-30T19:54:50.1633333' AS DateTime2))
INSERT [dbo].[categories] ([id], [name], [description], [created_at]) VALUES (3, N'Cơm', N'Rice dishes, ready-to-eat', CAST(N'2025-09-30T19:54:50.1633333' AS DateTime2))
INSERT [dbo].[categories] ([id], [name], [description], [created_at]) VALUES (4, N'Nước uống', N'Beverages including coffee, tea, and soft drinks', CAST(N'2025-10-09T07:32:55.2700000' AS DateTime2))
INSERT [dbo].[categories] ([id], [name], [description], [created_at]) VALUES (5, N'Pizza', N'Món pizza phong cách Ý, nhiều loại topping đa dạng.', CAST(N'2025-10-10T15:57:31.6000000' AS DateTime2))
INSERT [dbo].[categories] ([id], [name], [description], [created_at]) VALUES (6, N'Bún', N'Món bún Việt Nam truyền thống, dùng với thịt, chả hoặc hải sản.', CAST(N'2025-10-10T15:57:31.6000000' AS DateTime2))
SET IDENTITY_INSERT [dbo].[categories] OFF
GO
SET IDENTITY_INSERT [dbo].[chats] ON 

INSERT [dbo].[chats] ([id], [order_id], [buyer_id], [seller_id], [is_bot], [created_at]) VALUES (1, 1, 4, 2, 0, CAST(N'2025-09-30T19:54:50.2633333' AS DateTime2))
SET IDENTITY_INSERT [dbo].[chats] OFF
GO
SET IDENTITY_INSERT [dbo].[deliveries] ON 

INSERT [dbo].[deliveries] ([id], [order_id], [shipper_id], [status], [tracking_code], [delivered_at], [failure_reason], [created_at]) VALUES (1, 1, 6, N'assigned', N'TRACK001', NULL, NULL, CAST(N'2025-09-30T19:54:50.2333333' AS DateTime2))
INSERT [dbo].[deliveries] ([id], [order_id], [shipper_id], [status], [tracking_code], [delivered_at], [failure_reason], [created_at]) VALUES (2, 2, 6, N'in_transit', N'TRACK002', NULL, NULL, CAST(N'2025-09-30T19:54:50.2333333' AS DateTime2))
SET IDENTITY_INSERT [dbo].[deliveries] OFF
GO
SET IDENTITY_INSERT [dbo].[delivery_addresses] ON 

INSERT [dbo].[delivery_addresses] ([id], [user_id], [address_name], [full_address], [phone], [is_default], [created_at]) VALUES (1, 4, N'Home', N'123 Buyer St, Hanoi', N'0490659980', 1, CAST(N'2025-09-30T19:54:50.1600000' AS DateTime2))
INSERT [dbo].[delivery_addresses] ([id], [user_id], [address_name], [full_address], [phone], [is_default], [created_at]) VALUES (2, 5, N'Office', N'456 Buyer Ave, Saigon', N'0492142740', 1, CAST(N'2025-09-30T19:54:50.1600000' AS DateTime2))
SET IDENTITY_INSERT [dbo].[delivery_addresses] OFF
GO
SET IDENTITY_INSERT [dbo].[delivery_zones] ON 

INSERT [dbo].[delivery_zones] ([id], [shop_id], [zone_name], [delivery_fee], [min_order_value], [estimated_time], [is_active], [created_at]) VALUES (1, 1, N'Hanoi Center', CAST(2.00 AS Decimal(10, 2)), CAST(5.00 AS Decimal(10, 2)), 30, 1, CAST(N'2025-09-30T19:54:50.2400000' AS DateTime2))
INSERT [dbo].[delivery_zones] ([id], [shop_id], [zone_name], [delivery_fee], [min_order_value], [estimated_time], [is_active], [created_at]) VALUES (2, 2, N'Saigon Center', CAST(1.50 AS Decimal(10, 2)), CAST(0.00 AS Decimal(10, 2)), 20, 1, CAST(N'2025-09-30T19:54:50.2433333' AS DateTime2))
SET IDENTITY_INSERT [dbo].[delivery_zones] OFF
GO
SET IDENTITY_INSERT [dbo].[messages] ON 

INSERT [dbo].[messages] ([id], [chat_id], [sender_id], [message], [is_bot], [timestamp]) VALUES (1, 1, 4, N'When will my order be ready?', 0, CAST(N'2025-09-30T19:54:50.2700000' AS DateTime2))
INSERT [dbo].[messages] ([id], [chat_id], [sender_id], [message], [is_bot], [timestamp]) VALUES (2, 1, 2, N'In 30 minutes.', 0, CAST(N'2025-09-30T19:54:50.2700000' AS DateTime2))
SET IDENTITY_INSERT [dbo].[messages] OFF
GO
SET IDENTITY_INSERT [dbo].[notifications] ON 

INSERT [dbo].[notifications] ([id], [user_id], [type], [title], [message], [is_read], [created_at]) VALUES (1, 4, N'order_update', N'Order Pending', N'Your order is pending', 0, CAST(N'2025-09-30T19:54:50.2566667' AS DateTime2))
INSERT [dbo].[notifications] ([id], [user_id], [type], [title], [message], [is_read], [created_at]) VALUES (2, 4, N'promotion', N'New Voucher', N'You have a new voucher: 1223ABD', 0, CAST(N'2025-09-30T19:54:50.2600000' AS DateTime2))
INSERT [dbo].[notifications] ([id], [user_id], [type], [title], [message], [is_read], [created_at]) VALUES (3, 5, N'promotion', N'New Voucher', N'You have a new voucher: 4567EFG', 0, CAST(N'2025-09-30T19:54:50.2600000' AS DateTime2))
SET IDENTITY_INSERT [dbo].[notifications] OFF
GO
SET IDENTITY_INSERT [dbo].[order_items] ON 

INSERT [dbo].[order_items] ([id], [order_id], [product_id], [quantity], [unit_price]) VALUES (1, 1, 1, 2, CAST(5.00 AS Decimal(10, 2)))
INSERT [dbo].[order_items] ([id], [order_id], [product_id], [quantity], [unit_price]) VALUES (2, 2, 3, 1, CAST(3.00 AS Decimal(10, 2)))
INSERT [dbo].[order_items] ([id], [order_id], [product_id], [quantity], [unit_price]) VALUES (3, 2, 4, 1, CAST(4.00 AS Decimal(10, 2)))
SET IDENTITY_INSERT [dbo].[order_items] OFF
GO
SET IDENTITY_INSERT [dbo].[order_status_history] ON 

INSERT [dbo].[order_status_history] ([id], [order_id], [status], [notes], [changed_by], [created_at]) VALUES (1, 1, N'pending', NULL, 4, CAST(N'2025-09-30T19:54:50.2733333' AS DateTime2))
SET IDENTITY_INSERT [dbo].[order_status_history] OFF
GO
SET IDENTITY_INSERT [dbo].[orders] ON 

INSERT [dbo].[orders] ([id], [buyer_id], [shop_id], [delivery_address_id], [total_amount], [status], [voucher_id], [notes], [created_at], [recipient_name], [recipient_phone], [address_text], [latitude], [longitude]) VALUES (1, 4, 1, 1, CAST(10.00 AS Decimal(10, 2)), N'pending', 1, N'Extra spicy', CAST(N'2025-09-30T19:54:50.2033333' AS DateTime2), N'Buyer One', N'0127363062', N'123 Buyer St, Hanoi', CAST(21.028500 AS Decimal(9, 6)), CAST(105.854200 AS Decimal(9, 6)))
INSERT [dbo].[orders] ([id], [buyer_id], [shop_id], [delivery_address_id], [total_amount], [status], [voucher_id], [notes], [created_at], [recipient_name], [recipient_phone], [address_text], [latitude], [longitude]) VALUES (2, 5, 2, 2, CAST(7.00 AS Decimal(10, 2)), N'confirmed', 2, NULL, CAST(N'2025-09-30T19:54:50.2033333' AS DateTime2), N'Buyer Two', N'0150651604', N'456 Buyer Ave, Saigon', CAST(10.823100 AS Decimal(9, 6)), CAST(106.629700 AS Decimal(9, 6)))
SET IDENTITY_INSERT [dbo].[orders] OFF
GO
SET IDENTITY_INSERT [dbo].[payment_methods] ON 

INSERT [dbo].[payment_methods] ([id], [name], [description], [is_active], [created_at]) VALUES (1, N'Cash on Delivery', N'Pay when delivered', 1, CAST(N'2025-09-30T19:54:50.2166667' AS DateTime2))
INSERT [dbo].[payment_methods] ([id], [name], [description], [is_active], [created_at]) VALUES (2, N'Credit Card', N'Pay with card', 1, CAST(N'2025-09-30T19:54:50.2166667' AS DateTime2))
SET IDENTITY_INSERT [dbo].[payment_methods] OFF
GO
SET IDENTITY_INSERT [dbo].[payments] ON 

INSERT [dbo].[payments] ([id], [order_id], [payment_method_id], [amount], [status], [transaction_id], [payment_date], [created_at]) VALUES (1, 1, 1, CAST(10.00 AS Decimal(10, 2)), N'pending', NULL, NULL, CAST(N'2025-09-30T19:54:50.2266667' AS DateTime2))
INSERT [dbo].[payments] ([id], [order_id], [payment_method_id], [amount], [status], [transaction_id], [payment_date], [created_at]) VALUES (2, 2, 2, CAST(7.00 AS Decimal(10, 2)), N'completed', N'TX123', CAST(N'2025-09-29T00:00:00.0000000' AS DateTime2), CAST(N'2025-09-30T19:54:50.2266667' AS DateTime2))
SET IDENTITY_INSERT [dbo].[payments] OFF
GO
SET IDENTITY_INSERT [dbo].[products] ON 

INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (1, 1, 1, N'Pho Bo', N'Pho bo nong hoi, thom ngon, giao hang tan noi', 5, 1, N'http://localhost:8080/uploads/product-images/108e4ac9-afa1-41d9-bfa3-21a87f48231d.png', N'active', CAST(N'2025-09-30T19:54:50.1733333' AS DateTime2), CAST(N'2025-10-09T09:56:32.1900000' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (2, 1, 1, N'Pho Ga', N'Pho ga thom ngon, nuoc dung dam da, giao hang nong', 4.5, 1, N'http://localhost:8080/uploads/product-images/853f1d3f-9620-44ee-b400-69a7423ae9f9.png', N'active', CAST(N'2025-09-30T19:54:50.1766667' AS DateTime2), CAST(N'2025-10-09T09:53:59.9733333' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (3, 2, 2, N'Banh Mi Thit', N'Banh mi thit nuong thom ngon, rau tuoi, giao hang nhanh', 3, 1, N'http://localhost:8080/uploads/product-images/ea11bcc5-f9e0-47d8-bca8-b7c651f23f95.png', N'active', CAST(N'2025-09-30T19:54:50.1766667' AS DateTime2), CAST(N'2025-10-09T18:48:02.6233333' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (4, 2, 3, N'Com Ga', N'Com ga Hoi An thom ngon, gao vang nghe, nuoc cham dam da', 4, 1, N'http://localhost:8080/uploads/product-images/2c2e5602-bbf3-4e52-9a21-fcd18e4dc2d9.png', N'active', CAST(N'2025-09-30T19:54:50.1766667' AS DateTime2), CAST(N'2025-10-09T18:48:53.4233333' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (5, 3, 1, N'Mì Quảng Tôm Thịt', N'Mi Quang dac san Da Nang voi tom, thit va rau song. (Traditional Da Nang Quang noodles with shrimp, pork, and fresh herbs.)', 4, 1, N'http://localhost:8080/uploads/product-images/a47535d5-188c-4415-be4e-9bcfe297b040.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T18:49:30.3633333' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (6, 3, 1, N'Mì Quảng Gà', N'Mi Quang ga thom ngon, an kem rau thom va dau phong. (Chicken Quang noodles served with herbs and roasted peanuts.)', 3.8, 1, N'http://localhost:8080/uploads/product-images/0934f1d8-025d-4055-8a86-bd63d614d6b9.jpg', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T18:50:28.9066667' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (7, 3, 3, N'Bánh Tráng Cuốn Thịt Heo', N'Banh trang cuon thit heo tuoi ngon, nuoc cham dam vi mien Trung. (Pork and vegetables rolled in rice paper with Central-style dipping sauce.)', 4.5, 1, N'http://localhost:8080/uploads/product-images/ecfcd397-682a-4774-9e96-b5f5f6715908.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T18:51:29.9033333' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (8, 3, 3, N'Bún Mắm', N'Bun mam Da Nang, huong vi dac trung manh me. (Fermented fish noodle soup — strong Da Nang flavor.)', 4.2, 1, N'http://localhost:8080/uploads/product-images/6f053d01-3de4-4645-90f0-f4857cb52cba.jpg', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T18:52:54.1700000' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (9, 3, 3, N'Cơm Hến', N'Com hen Hue cay nhe, topping hen xao thom ngon. (Hue-style baby clam rice with mild chili and peanuts.)', 3.5, 1, N'http://localhost:8080/uploads/product-images/d0d057ac-d2a1-4edd-be68-fc3758592166.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T18:53:35.2700000' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (10, 4, 3, N'Cơm Gà Hội An', N'Com ga Hoi An noi tieng, gao vang nghe va nuoc cham cay. (Hoi An-style chicken rice with turmeric and chili sauce.)', 4.5, 1, N'http://localhost:8080/uploads/product-images/97d7c395-c9fd-4889-90f4-b387b1022845.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T18:54:12.9100000' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (11, 4, 3, N'Cơm Sườn', N'Com suon nuong thom lung, an kem canh va dua leo. (Grilled pork ribs with rice, soup, and cucumber.)', 4, 1, N'http://localhost:8080/uploads/product-images/12ab4828-0801-44b5-afc0-f82cf7348b74.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T18:55:16.9700000' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (12, 4, 3, N'Cơm Cá Kho', N'Com ca kho dam da, nau theo phong cach gia dinh. (Home-style braised fish with rice.)', 4.2, 1, N'http://localhost:8080/uploads/product-images/70c908ae-f941-4f87-8e3d-7a94bbcd91d4.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T18:56:51.3000000' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (13, 4, 3, N'Cơm Thịt Kho', N'Com thit kho trung beo ngay, huong vi truyen thong. (Stewed pork and egg rice — traditional flavor.)', 3.8, 1, N'http://localhost:8080/uploads/product-images/f67a785e-3676-42dd-906b-66deccb4a868.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T18:57:23.4900000' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (14, 4, 2, N'Bánh Mì Gà Xé', N'Banh mi ga xe an kem do chua, phu hop bua sang. (Shredded chicken Banh Mi with pickles, perfect for breakfast.)', 3, 1, N'http://localhost:8080/uploads/product-images/0a1ef7fd-5318-46bd-9cc9-b8cb754456a5.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T18:57:56.2533333' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (15, 5, 1, N'Bún Chả Cá', N'Bun cha ca Da Nang noi tieng, nuoc dung ca chua thanh ngot. (Da Nang fish cake noodle soup with light tomato broth.)', 4, 1, N'http://localhost:8080/uploads/product-images/b78ecd3f-3089-470d-99d3-edc8aecb7bc9.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T18:58:34.3900000' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (16, 5, 1, N'Bún Riêu', N'Bun rieu cua, dau hu va rau thom. (Crab noodle soup with tofu and herbs.)', 3.8, 1, N'http://localhost:8080/uploads/product-images/66cc71f2-047d-4d4f-9954-147ef5b5d1c1.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T18:59:37.6533333' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (17, 5, 3, N'Cơm Cá Chiên', N'Com ca chien gion voi nuoc mam chanh ot. (Crispy fried fish with chili-lime fish sauce.)', 4.2, 1, N'http://localhost:8080/uploads/product-images/16c14da9-763c-4443-aa75-ea8aa802e988.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T19:00:26.1733333' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (18, 5, 3, N'Cơm Tôm Rim', N'Com tom rim dam vi, tom tuoi rim man ngot. (Caramelized shrimp rice — savory and sweet flavor.)', 4.5, 1, N'http://localhost:8080/uploads/product-images/cbbaff4f-0f26-4856-9135-cf1fbb79dcb7.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T19:01:36.1066667' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (19, 5, 3, N'Cơm Bò Lúc Lắc', N'Com bo luc lac, an kem trung op la va salad. (Shaking beef rice with fried egg and salad.)', 5, 1, N'http://localhost:8080/uploads/product-images/aa8ba17a-5213-4de8-98f1-5ac362d66f85.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T19:02:29.0700000' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (20, 6, 2, N'Pizza Margherita', N'Pizza Margherita truyen thong voi ca chua, pho mai mozzarella va hung que. (Classic pizza with tomato, mozzarella, and basil.)', 6.5, 1, N'http://localhost:8080/uploads/product-images/f1bf4a36-b61c-4b17-aeac-3e16698ad1da.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T19:02:56.9533333' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (21, 6, 2, N'Pizza Hawaiian', N'Pizza Hawaiian voi giam bong va dua, vi ngot nhe. (Ham, pineapple, and cheese on a thin crust.)', 7, 1, N'http://localhost:8080/uploads/product-images/10bd41c7-eac7-4a96-a3e2-ab5b82e81c24.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T19:03:30.6066667' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (22, 6, 2, N'Pizza Pepperoni', N'Pizza Pepperoni cay nhe, pho mai tan chay. (Spicy pepperoni pizza with melted cheese.)', 7.5, 1, N'http://localhost:8080/uploads/product-images/fb4aee94-a88c-4a99-9407-93982a2c1566.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T19:04:02.9500000' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (23, 6, 3, N'Cơm Bò Nướng', N'Com bo nuong voi salad tuoi va nuoc sot dac biet. (Grilled beef rice with salad and house sauce.)', 5.5, 1, N'http://localhost:8080/uploads/product-images/242db6b1-0ab4-49e2-b3ff-ab38e544805d.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T19:04:49.9533333' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (24, 6, 3, N'Cơm Gà Nướng', N'Com ga nuong thom lung, an kem dua leo va trung. (Grilled chicken rice with cucumber and egg.)', 5, 1, N'http://localhost:8080/uploads/product-images/365d7b1a-45f7-4b75-9cb9-bf2f1fea759c.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T19:05:41.7500000' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (25, 7, 2, N'Bánh Mì Pate', N'Banh mi pate gion, nhan pate va dua leo. (Crispy Banh Mi with pate and cucumber.)', 2.5, 1, N'http://localhost:8080/uploads/product-images/40ecf903-27e1-4c6a-b9c4-2acd6860aeb4.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T19:06:32.4333333' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (26, 7, 2, N'Bánh Mì Trứng', N'Banh mi trung chien, mon sang quen thuoc cua nguoi Viet. (Fried egg Banh Mi — a classic Vietnamese breakfast.)', 2.8, 1, N'http://localhost:8080/uploads/product-images/03f8a199-34ff-40fa-b9f2-92b5a74182a8.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T19:07:10.3933333' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (27, 7, 3, N'Cơm Tấm Bì', N'Com tam bi voi thit nuong va trung. (Broken rice with grilled pork and shredded pork skin.)', 4, 1, N'http://localhost:8080/uploads/product-images/a0bc5b00-a161-41a5-bfdf-17722f0f87b2.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T19:07:57.3633333' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (28, 7, 1, N'Phở Tái', N'Pho tai bo tuoi, nuoc dung trong ngot thanh. (Beef noodle soup with rare steak slices.)', 5, 1, N'http://localhost:8080/uploads/product-images/b81cc1e5-03f7-4fd4-8aeb-1622ba9c2dcf.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T19:08:30.5933333' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (29, 7, 1, N'Phở Hải Sản', N'Pho hai san voi tom va muc tuoi. (Seafood noodle soup with shrimp and squid.)', 5.5, 1, N'http://localhost:8080/uploads/product-images/fb6f5e0e-3e88-418c-b8d0-2f500d37d15c.png', N'active', CAST(N'2025-10-09T07:20:20.8466667' AS DateTime2), CAST(N'2025-10-09T19:08:49.6466667' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (30, 7, 4, N'Cà Phê Sữa Đá', N'Ca phe sua da dam vi Viet Nam, pha phin truyen thong. (Vietnamese iced coffee with condensed milk, brewed drip-style.)', 2.5, 1, N'http://localhost:8080/uploads/product-images/c9aee168-a10c-42bb-820b-d47144c84e95.png', N'active', CAST(N'2025-10-09T07:43:05.7233333' AS DateTime2), CAST(N'2025-10-09T19:09:13.1366667' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (31, 7, 4, N'Trà Đào Cam Sả', N'Tra dao cam sa tuoi mat, huong thom diu nhe. (Peach tea with lemongrass and citrus flavor.)', 3, 1, N'http://localhost:8080/uploads/product-images/61693157-d9f5-45f8-b120-623d6f72d21a.png', N'active', CAST(N'2025-10-09T07:43:05.7233333' AS DateTime2), CAST(N'2025-10-09T19:09:31.9666667' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (32, 7, 4, N'Sinh Tố Bơ', N'Sinh to bo beo ngay, xay cung sua dac. (Creamy avocado smoothie with milk.)', 3.5, 1, N'http://localhost:8080/uploads/product-images/246cde1d-e181-47f0-b90b-7ab194e551fc.png', N'active', CAST(N'2025-10-09T07:43:05.7233333' AS DateTime2), CAST(N'2025-10-09T19:10:22.8933333' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (33, 7, 4, N'Nước Ép Dưa Hấu', N'Nuoc ep dua hau tuoi, khong them duong. (Fresh watermelon juice, naturally sweet.)', 3, 1, N'http://localhost:8080/uploads/product-images/f8d20c7e-3473-4bf8-9167-cab581e8fbe0.png', N'active', CAST(N'2025-10-09T07:43:05.7233333' AS DateTime2), CAST(N'2025-10-09T19:11:11.8633333' AS DateTime2))
INSERT [dbo].[products] ([id], [shop_id], [category_id], [name], [description], [price], [is_available], [image_url], [status], [created_at], [updated_at]) VALUES (34, 7, 4, N'Matcha Latte', N'Matcha latte mat lanh, lop sua beo min. (Iced matcha latte with creamy milk foam.)', 3.8, 1, N'http://localhost:8080/uploads/product-images/67ec3246-5620-4b75-8b8f-749deb8389af.png', N'active', CAST(N'2025-10-09T07:43:05.7233333' AS DateTime2), CAST(N'2025-10-09T19:11:16.2266667' AS DateTime2))
SET IDENTITY_INSERT [dbo].[products] OFF
GO
SET IDENTITY_INSERT [dbo].[reviews] ON 

INSERT [dbo].[reviews] ([id], [order_id], [product_id], [user_id], [rating], [comment], [image_url], [created_at]) VALUES (1, 1, 1, 4, 5, N'Delicious ready-to-eat Pho!', NULL, CAST(N'2025-09-30T19:54:50.2500000' AS DateTime2))
SET IDENTITY_INSERT [dbo].[reviews] OFF
GO
SET IDENTITY_INSERT [dbo].[shop_reviews] ON 

INSERT [dbo].[shop_reviews] ([id], [order_id], [shop_id], [user_id], [rating], [comment], [created_at]) VALUES (1, 1, 1, 4, 4, N'Good service and fast delivery', CAST(N'2025-09-30T19:54:50.2533333' AS DateTime2))
SET IDENTITY_INSERT [dbo].[shop_reviews] OFF
GO
SET IDENTITY_INSERT [dbo].[shops] ON 

INSERT [dbo].[shops] ([id], [seller_id], [name], [description], [address], [opening_hours], [rating], [created_at]) VALUES (1, 2, N'Pho Delicious', N'Best ready-to-eat Pho in town, delivered hot', N'100 Pho St, Hanoi', N'8AM-10PM', CAST(4.50 AS Decimal(3, 2)), CAST(N'2025-09-30T19:54:50.1700000' AS DateTime2))
INSERT [dbo].[shops] ([id], [seller_id], [name], [description], [address], [opening_hours], [rating], [created_at]) VALUES (2, 3, N'Banh Mi King', N'Fresh ready-to-eat Banh Mi daily, fast delivery', N'200 Banh Mi Ave, Saigon', N'7AM-9PM', CAST(4.80 AS Decimal(3, 2)), CAST(N'2025-09-30T19:54:50.1700000' AS DateTime2))
INSERT [dbo].[shops] ([id], [seller_id], [name], [description], [address], [opening_hours], [rating], [created_at]) VALUES (3, 4, N'Mì Quảng 123', N'Mì Quảng truyền thống Đà Nẵng với tôm, thịt và rau thơm tươi.', N'12 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', N'7AM-9PM', CAST(4.60 AS Decimal(3, 2)), CAST(N'2025-10-09T07:16:38.6200000' AS DateTime2))
INSERT [dbo].[shops] ([id], [seller_id], [name], [description], [address], [opening_hours], [rating], [created_at]) VALUES (4, 5, N'Cơm Gà Bà Buội', N'Món cơm gà Hội An nổi tiếng, gạo vàng nghệ, nước chấm cay đặc trưng.', N'45 Lê Duẩn, Hải Châu, Đà Nẵng', N'8AM-10PM', CAST(4.70 AS Decimal(3, 2)), CAST(N'2025-10-09T07:16:38.6200000' AS DateTime2))
INSERT [dbo].[shops] ([id], [seller_id], [name], [description], [address], [opening_hours], [rating], [created_at]) VALUES (5, 6, N'Bún Chả Cá 109', N'Bún chả cá Đà Nẵng tươi ngon, nước dùng đậm đà, phục vụ nhanh chóng.', N'109 Nguyễn Chí Thanh, Hải Châu, Đà Nẵng', N'6AM-8PM', CAST(4.50 AS Decimal(3, 2)), CAST(N'2025-10-09T07:16:38.6200000' AS DateTime2))
INSERT [dbo].[shops] ([id], [seller_id], [name], [description], [address], [opening_hours], [rating], [created_at]) VALUES (6, 7, N'Pizza Zone', N'Pizza phong cách Ý với hương vị đặc trưng và giao hàng nhanh chóng.', N'80 Phan Châu Trinh, Hải Châu, Đà Nẵng', N'10AM-11PM', CAST(4.80 AS Decimal(3, 2)), CAST(N'2025-10-09T07:16:38.6200000' AS DateTime2))
INSERT [dbo].[shops] ([id], [seller_id], [name], [description], [address], [opening_hours], [rating], [created_at]) VALUES (7, 8, N'Coffee & Chill', N'Quán cà phê ấm cúng với đồ uống đa dạng, bánh ngọt và wifi miễn phí.', N'21 Trần Phú, Hải Châu, Đà Nẵng', N'7AM-10PM', CAST(4.90 AS Decimal(3, 2)), CAST(N'2025-10-09T07:16:38.6200000' AS DateTime2))
SET IDENTITY_INSERT [dbo].[shops] OFF
GO
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
SET IDENTITY_INSERT [dbo].[vouchers] ON 

INSERT [dbo].[vouchers] ([id], [code], [discount_type], [discount_value], [min_order_value], [expiry_date], [max_uses], [used_count], [created_by], [created_at]) VALUES (1, N'1223ABD', N'percentage', CAST(10.00 AS Decimal(5, 2)), CAST(20.00 AS Decimal(10, 2)), CAST(N'2025-12-31' AS Date), 1, 0, 1, CAST(N'2025-09-30T19:54:50.1866667' AS DateTime2))
INSERT [dbo].[vouchers] ([id], [code], [discount_type], [discount_value], [min_order_value], [expiry_date], [max_uses], [used_count], [created_by], [created_at]) VALUES (2, N'4567EFG', N'percentage', CAST(15.00 AS Decimal(5, 2)), CAST(15.00 AS Decimal(10, 2)), CAST(N'2025-12-31' AS Date), 1, 0, 1, CAST(N'2025-09-30T19:54:50.1900000' AS DateTime2))
INSERT [dbo].[vouchers] ([id], [code], [discount_type], [discount_value], [min_order_value], [expiry_date], [max_uses], [used_count], [created_by], [created_at]) VALUES (3, N'89HIJK0', N'percentage', CAST(5.00 AS Decimal(5, 2)), CAST(10.00 AS Decimal(10, 2)), CAST(N'2025-12-31' AS Date), 1, 0, 1, CAST(N'2025-09-30T19:54:50.1900000' AS DateTime2))
SET IDENTITY_INSERT [dbo].[vouchers] OFF
GO
/****** Object:  Index [UQ__deliveri__46596228095DA7D8]    Script Date: 10/11/2025 10:36:52 AM ******/
ALTER TABLE [dbo].[deliveries] ADD UNIQUE NONCLUSTERED 
(
	[order_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [UQ__shops__780A0A962C1B6987]    Script Date: 10/11/2025 10:36:52 AM ******/
ALTER TABLE [dbo].[shops] ADD UNIQUE NONCLUSTERED 
(
	[seller_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__users__AB6E61645F04C18A]    Script Date: 10/11/2025 10:36:52 AM ******/
ALTER TABLE [dbo].[users] ADD UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__vouchers__357D4CF93B2C828D]    Script Date: 10/11/2025 10:36:52 AM ******/
ALTER TABLE [dbo].[vouchers] ADD UNIQUE NONCLUSTERED 
(
	[code] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[categories] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[chats] ADD  DEFAULT ((0)) FOR [is_bot]
GO
ALTER TABLE [dbo].[chats] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[deliveries] ADD  DEFAULT ('assigned') FOR [status]
GO
ALTER TABLE [dbo].[deliveries] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[delivery_addresses] ADD  DEFAULT ((0)) FOR [is_default]
GO
ALTER TABLE [dbo].[delivery_addresses] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[delivery_zones] ADD  DEFAULT ((0)) FOR [min_order_value]
GO
ALTER TABLE [dbo].[delivery_zones] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[delivery_zones] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[messages] ADD  DEFAULT ((0)) FOR [is_bot]
GO
ALTER TABLE [dbo].[messages] ADD  DEFAULT (getdate()) FOR [timestamp]
GO
ALTER TABLE [dbo].[notifications] ADD  DEFAULT ((0)) FOR [is_read]
GO
ALTER TABLE [dbo].[notifications] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[order_status_history] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[orders] ADD  DEFAULT ('pending') FOR [status]
GO
ALTER TABLE [dbo].[orders] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[payment_methods] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[payment_methods] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[payments] ADD  DEFAULT ('pending') FOR [status]
GO
ALTER TABLE [dbo].[payments] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[products] ADD  DEFAULT ((1)) FOR [is_available]
GO
ALTER TABLE [dbo].[products] ADD  DEFAULT ('active') FOR [status]
GO
ALTER TABLE [dbo].[products] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[products] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[reviews] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[shop_reviews] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[shops] ADD  DEFAULT ((0.00)) FOR [rating]
GO
ALTER TABLE [dbo].[shops] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ('buyer') FOR [role]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT ((0)) FOR [is_verified]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[users] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[vouchers] ADD  DEFAULT (NULL) FOR [max_uses]
GO
ALTER TABLE [dbo].[vouchers] ADD  DEFAULT ((0)) FOR [used_count]
GO
ALTER TABLE [dbo].[vouchers] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[chats]  WITH CHECK ADD FOREIGN KEY([buyer_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[chats]  WITH CHECK ADD FOREIGN KEY([order_id])
REFERENCES [dbo].[orders] ([id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[chats]  WITH CHECK ADD FOREIGN KEY([seller_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[deliveries]  WITH CHECK ADD FOREIGN KEY([order_id])
REFERENCES [dbo].[orders] ([id])
GO
ALTER TABLE [dbo].[deliveries]  WITH CHECK ADD FOREIGN KEY([shipper_id])
REFERENCES [dbo].[users] ([id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[delivery_addresses]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[delivery_zones]  WITH CHECK ADD FOREIGN KEY([shop_id])
REFERENCES [dbo].[shops] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[messages]  WITH CHECK ADD FOREIGN KEY([chat_id])
REFERENCES [dbo].[chats] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[messages]  WITH CHECK ADD FOREIGN KEY([sender_id])
REFERENCES [dbo].[users] ([id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[notifications]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[order_items]  WITH CHECK ADD FOREIGN KEY([order_id])
REFERENCES [dbo].[orders] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[order_items]  WITH CHECK ADD FOREIGN KEY([product_id])
REFERENCES [dbo].[products] ([id])
GO
ALTER TABLE [dbo].[order_status_history]  WITH CHECK ADD FOREIGN KEY([changed_by])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[order_status_history]  WITH CHECK ADD FOREIGN KEY([order_id])
REFERENCES [dbo].[orders] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[orders]  WITH CHECK ADD FOREIGN KEY([buyer_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[orders]  WITH CHECK ADD FOREIGN KEY([delivery_address_id])
REFERENCES [dbo].[delivery_addresses] ([id])
GO
ALTER TABLE [dbo].[orders]  WITH CHECK ADD FOREIGN KEY([shop_id])
REFERENCES [dbo].[shops] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[orders]  WITH CHECK ADD FOREIGN KEY([voucher_id])
REFERENCES [dbo].[vouchers] ([id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[payments]  WITH CHECK ADD FOREIGN KEY([order_id])
REFERENCES [dbo].[orders] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[payments]  WITH CHECK ADD FOREIGN KEY([payment_method_id])
REFERENCES [dbo].[payment_methods] ([id])
GO
ALTER TABLE [dbo].[products]  WITH CHECK ADD FOREIGN KEY([category_id])
REFERENCES [dbo].[categories] ([id])
GO
ALTER TABLE [dbo].[products]  WITH CHECK ADD FOREIGN KEY([shop_id])
REFERENCES [dbo].[shops] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[reviews]  WITH CHECK ADD FOREIGN KEY([order_id])
REFERENCES [dbo].[orders] ([id])
GO
ALTER TABLE [dbo].[reviews]  WITH CHECK ADD FOREIGN KEY([product_id])
REFERENCES [dbo].[products] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[reviews]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[shop_reviews]  WITH CHECK ADD FOREIGN KEY([order_id])
REFERENCES [dbo].[orders] ([id])
GO
ALTER TABLE [dbo].[shop_reviews]  WITH CHECK ADD FOREIGN KEY([shop_id])
REFERENCES [dbo].[shops] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[shop_reviews]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[shops]  WITH CHECK ADD FOREIGN KEY([seller_id])
REFERENCES [dbo].[users] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[vouchers]  WITH CHECK ADD FOREIGN KEY([created_by])
REFERENCES [dbo].[users] ([id])
GO
ALTER TABLE [dbo].[deliveries]  WITH CHECK ADD CHECK  (([status]='failed' OR [status]='delivered' OR [status]='in_transit' OR [status]='picked_up' OR [status]='assigned'))
GO
ALTER TABLE [dbo].[notifications]  WITH CHECK ADD CHECK  (([type]='admin_message' OR [type]='promotion' OR [type]='order_update'))
GO
ALTER TABLE [dbo].[orders]  WITH CHECK ADD CHECK  (([status]='cancelled' OR [status]='delivered' OR [status]='shipping' OR [status]='preparing' OR [status]='confirmed' OR [status]='pending'))
GO
ALTER TABLE [dbo].[payments]  WITH CHECK ADD CHECK  (([status]='refunded' OR [status]='cancelled' OR [status]='failed' OR [status]='completed' OR [status]='pending'))
GO
ALTER TABLE [dbo].[products]  WITH CHECK ADD CHECK  (([status]='out_of_stock' OR [status]='inactive' OR [status]='active'))
GO
ALTER TABLE [dbo].[reviews]  WITH CHECK ADD CHECK  (([rating]>=(1) AND [rating]<=(5)))
GO
ALTER TABLE [dbo].[shop_reviews]  WITH CHECK ADD CHECK  (([rating]>=(1) AND [rating]<=(5)))
GO
ALTER TABLE [dbo].[users]  WITH CHECK ADD CHECK  (([role]='shipper' OR [role]='admin' OR [role]='seller' OR [role]='buyer'))
GO
ALTER TABLE [dbo].[verification_codes]  WITH CHECK ADD CHECK  (([type]='PASSWORD_RESET' OR [type]='EMAIL_VERIFICATION'))
GO
ALTER TABLE [dbo].[vouchers]  WITH CHECK ADD CHECK  (([discount_type]='fixed' OR [discount_type]='percentage'))
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

CREATE TABLE [dbo].[revenue_stats](
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [shop_id] INT,
    [total_orders] INT DEFAULT 0,
    [total_revenue] DECIMAL(10,2) DEFAULT 0,
    [month] INT,
    [year] INT,
    [created_at] DATETIME2 DEFAULT GETDATE()
);
ALTER TABLE orders
DROP COLUMN latitude, longitude;

ALTER TABLE orders
ADD latitude FLOAT NULL,
    longitude FLOAT NULL;

EXEC sp_columns orders;



SELECT 
    YEAR(o.created_at) AS year,
    MONTH(o.created_at) AS month,
    SUM(o.total_amount) AS total_revenue,
    COUNT(o.id) AS total_orders
FROM orders o
WHERE o.status = 'completed'
GROUP BY YEAR(o.created_at), MONTH(o.created_at)
ORDER BY year DESC, month DESC;
SELECT 
    s.name AS shop_name,
    SUM(o.total_amount) AS revenue
FROM orders o
JOIN shops s ON o.shop_id = s.id
WHERE o.status = 'completed'
GROUP BY s.name
ORDER BY revenue DESC;
SELECT role, COUNT(*) AS total_users
FROM users
GROUP BY role;

ALTER TABLE users ADD is_banned BIT DEFAULT 0;
ALTER TABLE orders ADD deleted_at DATETIME2 NULL; -- nếu cần soft delete



	 UPDATE users 
SET role = 'admin', updated_at = GETDATE()
WHERE id = 13;
UPDATE users
SET is_banned = 0
WHERE is_banned IS NULL;

-- 2️⃣ Đặt mặc định mặc định cho cột (phòng trường hợp chưa có DEFAULT)
--ALTER TABLE users
--ADD CONSTRAINT DF_users_is_banned DEFAULT 0 FOR is_banned;

-- 3️⃣ (Tuỳ chọn, nếu muốn cấm NULL luôn)
--ALTER TABLE users
--ALTER COLUMN is_banned BIT NOT NULL;

-- =============================================
-- Admin helper and procedures for editing/deleting users
-- =============================================
GO
IF OBJECT_ID('dbo.fn_is_admin', 'FN') IS NOT NULL DROP FUNCTION dbo.fn_is_admin;
GO
CREATE FUNCTION dbo.fn_is_admin(@user_id INT)
RETURNS BIT
AS
BEGIN
    DECLARE @isAdmin BIT = 0;
    IF EXISTS (
        SELECT 1 FROM dbo.users
        WHERE id = @user_id
          AND role = 'admin'
          AND (deleted_at IS NULL)
          AND ISNULL(is_banned, 0) = 0
    )
        SET @isAdmin = 1;
    RETURN @isAdmin;
END;
GO

-- Update user's full name and/or role (admin-only)
IF OBJECT_ID('dbo.sp_admin_update_user', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_admin_update_user;
GO
CREATE PROCEDURE dbo.sp_admin_update_user
    @admin_id  INT,
    @user_id   INT,
    @full_name NVARCHAR(255) = NULL,
    @role      NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF dbo.fn_is_admin(@admin_id) = 0
        THROW 50010, 'Only admin can update users.', 1;

    IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE id = @user_id AND deleted_at IS NULL)
        THROW 50011, 'User not found or deleted.', 1;

    IF @role IS NOT NULL AND @role NOT IN ('buyer','seller','admin','shipper')
        THROW 50012, 'Invalid role value.', 1;

    UPDATE dbo.users
    SET full_name = COALESCE(@full_name, full_name),
        role      = COALESCE(@role, role),
        updated_at = GETDATE()
    WHERE id = @user_id;
END;
GO

-- Soft delete (admin-only): ban + mark deleted_at + anonymize PII to keep UNIQUE(email)
IF OBJECT_ID('dbo.sp_admin_soft_delete_user', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_admin_soft_delete_user;
GO
CREATE PROCEDURE dbo.sp_admin_soft_delete_user
    @admin_id INT,
    @user_id  INT
AS
BEGIN
    SET NOCOUNT ON;

    IF dbo.fn_is_admin(@admin_id) = 0
        THROW 50020, 'Only admin can delete users.', 1;

    IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE id = @user_id AND deleted_at IS NULL)
        THROW 50021, 'User not found or already deleted.', 1;

    UPDATE dbo.users
    SET is_banned  = 1,
        is_verified = 0,
        deleted_at = GETDATE(),
        email      = CONCAT('deleted+', CAST(id AS NVARCHAR(20)), '@example.com'),
        full_name  = CONCAT('[deleted] ', CAST(id AS NVARCHAR(20))),
        updated_at = GETDATE()
    WHERE id = @user_id;
END;
GO

-- Hard delete (admin-only): allowed only when no NO ACTION references exist
IF OBJECT_ID('dbo.sp_admin_hard_delete_user', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_admin_hard_delete_user;
GO
CREATE PROCEDURE dbo.sp_admin_hard_delete_user
    @admin_id INT,
    @user_id  INT
AS
BEGIN
    SET NOCOUNT ON;

    IF dbo.fn_is_admin(@admin_id) = 0
        THROW 50030, 'Only admin can permanently delete users.', 1;

    IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE id = @user_id)
        THROW 50031, 'User not found.', 1;

    -- Block hard delete if referenced by NO ACTION foreign keys
    IF EXISTS (SELECT 1 FROM dbo.orders WHERE buyer_id = @user_id)
        THROW 50032, 'Cannot hard delete: user has orders.', 1;
    IF EXISTS (SELECT 1 FROM dbo.delivery_addresses WHERE user_id = @user_id)
        THROW 50033, 'Cannot hard delete: user has delivery addresses.', 1;
    IF EXISTS (SELECT 1 FROM dbo.vouchers WHERE created_by = @user_id)
        THROW 50034, 'Cannot hard delete: user created vouchers.', 1;
    IF EXISTS (SELECT 1 FROM dbo.reviews WHERE user_id = @user_id)
        THROW 50035, 'Cannot hard delete: user has reviews.', 1;
    IF EXISTS (SELECT 1 FROM dbo.shop_reviews WHERE user_id = @user_id)
        THROW 50036, 'Cannot hard delete: user has shop reviews.', 1;
    IF EXISTS (SELECT 1 FROM dbo.chats WHERE buyer_id = @user_id)
        THROW 50037, 'Cannot hard delete: user is referenced in chats.', 1;

    -- Shops (seller_id) will cascade delete; deliveries.shipper_id/messages.sender_id set NULL per schema
    DELETE FROM dbo.users WHERE id = @user_id;
END;
GO

-- Usage examples:
-- EXEC dbo.sp_admin_update_user       @admin_id = 1, @user_id = 13, @full_name = N'New Name', @role = 'seller';
-- EXEC dbo.sp_admin_soft_delete_user  @admin_id = 1, @user_id = 13;
-- EXEC dbo.sp_admin_hard_delete_user  @admin_id = 1, @user_id = 13; -- will fail if references exist



