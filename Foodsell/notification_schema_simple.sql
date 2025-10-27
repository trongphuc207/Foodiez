-- Notification System Schema - Simple Version
-- Tạo bảng notifications cho hệ thống thông báo

-- Tạo bảng notifications
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='notifications' AND xtype='U')
BEGIN
    CREATE TABLE notifications (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        content NTEXT NOT NULL,
        type NVARCHAR(50) NOT NULL,
        recipient_id INT NOT NULL,
        recipient_role NVARCHAR(20) NOT NULL,
        sender_id INT NULL,
        sender_role NVARCHAR(20) NULL,
        related_entity_id INT NULL,
        related_entity_type NVARCHAR(50) NULL,
        is_read BIT NOT NULL DEFAULT 0,
        is_visible BIT NOT NULL DEFAULT 1,
        priority INT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        read_at DATETIME2 NULL
    );
    
    PRINT 'Bảng notifications đã được tạo thành công!';
END
ELSE
BEGIN
    PRINT 'Bảng notifications đã tồn tại!';
END
