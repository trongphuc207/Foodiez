-- Notification System Schema
-- Tạo bảng notifications cho hệ thống thông báo

-- Tạo bảng notifications
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='notifications' AND xtype='U')
BEGIN
    CREATE TABLE notifications (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        content NTEXT NOT NULL,
        type NVARCHAR(50) NOT NULL, -- ORDER, PROMOTION, MESSAGE, DELIVERY, SYSTEM
        recipient_id INT NOT NULL,
        recipient_role NVARCHAR(20) NOT NULL, -- CUSTOMER, SELLER, SHIPPER, ADMIN
        sender_id INT NULL, -- null for system notifications
        sender_role NVARCHAR(20) NULL,
        related_entity_id INT NULL, -- order_id, product_id, etc.
        related_entity_type NVARCHAR(50) NULL, -- ORDER, PRODUCT, SHOP, etc.
        is_read BIT NOT NULL DEFAULT 0,
        is_visible BIT NOT NULL DEFAULT 1,
        priority INT NOT NULL DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=urgent
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        read_at DATETIME2 NULL
    );
    
    -- Tạo indexes để tối ưu performance
    CREATE INDEX IX_notifications_recipient_id ON notifications(recipient_id);
    CREATE INDEX IX_notifications_recipient_role ON notifications(recipient_role);
    CREATE INDEX IX_notifications_type ON notifications(type);
    CREATE INDEX IX_notifications_is_read ON notifications(is_read);
    CREATE INDEX IX_notifications_created_at ON notifications(created_at);
    CREATE INDEX IX_notifications_priority ON notifications(priority);
    
    -- Tạo foreign key constraints (nếu cần)
    -- ALTER TABLE notifications ADD CONSTRAINT FK_notifications_recipient 
    --     FOREIGN KEY (recipient_id) REFERENCES users(id);
    
    PRINT 'Bảng notifications đã được tạo thành công!';
END
ELSE
BEGIN
    PRINT 'Bảng notifications đã tồn tại!';
END

-- Thêm sample data để test
INSERT INTO notifications (title, content, type, recipient_id, recipient_role, priority) VALUES
('Chào mừng đến với FoodieExpress!', 'Cảm ơn bạn đã đăng ký tài khoản. Chúc bạn có trải nghiệm mua sắm tuyệt vời!', 'SYSTEM', 1, 'CUSTOMER', 1),
('Khuyến mãi đặc biệt!', 'Giảm giá 20% cho tất cả món ăn trong tuần này. Đừng bỏ lỡ cơ hội!', 'PROMOTION', 1, 'CUSTOMER', 2),
('Đơn hàng mới', 'Bạn có đơn hàng mới #12345 từ khách hàng', 'ORDER', 2, 'SELLER', 3),
('Giao hàng mới', 'Bạn được phân công giao đơn hàng #12345', 'DELIVERY', 3, 'SHIPPER', 4);

PRINT 'Sample notifications đã được thêm!';
