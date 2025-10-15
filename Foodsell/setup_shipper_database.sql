-- Script để kiểm tra và tạo bảng shippers nếu chưa tồn tại
-- Chạy script này trong SQL Server Management Studio hoặc Azure Data Studio

-- Kiểm tra xem bảng shippers đã tồn tại chưa
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='shippers' AND xtype='U')
BEGIN
    PRINT 'Creating shippers table...'
    
    -- Tạo bảng shippers
    CREATE TABLE shippers (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        vehicle_type NVARCHAR(50), -- xe máy, xe đạp, ô tô
        license_plate NVARCHAR(20),
        delivery_area NVARCHAR(255), -- khu vực giao hàng
        is_available BIT DEFAULT 1, -- trạng thái sẵn sàng
        rating DECIMAL(3,2) DEFAULT 0.00, -- đánh giá từ 0.00 đến 5.00
        total_deliveries INT DEFAULT 0, -- tổng số đơn đã giao
        total_earnings DECIMAL(15,2) DEFAULT 0.00, -- tổng thu nhập
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        
        -- Foreign key constraint
        CONSTRAINT FK_shippers_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        
        -- Unique constraint để đảm bảo mỗi user chỉ có 1 profile shipper
        CONSTRAINT UQ_shippers_user_id UNIQUE (user_id)
    );
    
    -- Tạo index để tối ưu truy vấn
    CREATE INDEX IX_shippers_user_id ON shippers(user_id);
    CREATE INDEX IX_shippers_is_available ON shippers(is_available);
    CREATE INDEX IX_shippers_delivery_area ON shippers(delivery_area);
    CREATE INDEX IX_shippers_rating ON shippers(rating);
    
    -- Tạo trigger để tự động cập nhật updated_at
    CREATE TRIGGER TR_shippers_updated_at
    ON shippers
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE shippers 
        SET updated_at = GETDATE()
        FROM shippers s
        INNER JOIN inserted i ON s.id = i.id;
    END;
    
    PRINT 'Shippers table created successfully!'
END
ELSE
BEGIN
    PRINT 'Shippers table already exists.'
END

-- Kiểm tra xem có user nào có role 'shipper' không
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.phone,
    u.role,
    CASE 
        WHEN s.id IS NOT NULL THEN 'Has Shipper Profile'
        ELSE 'No Shipper Profile'
    END as profile_status
FROM users u
LEFT JOIN shippers s ON u.id = s.user_id
WHERE u.role = 'shipper'
ORDER BY u.id;

-- Nếu có user với role 'shipper' nhưng chưa có profile, có thể tạo profile mẫu
-- Uncomment các dòng dưới nếu muốn tạo profile tự động
/*
INSERT INTO shippers (user_id, vehicle_type, license_plate, delivery_area, is_available, rating, total_deliveries, total_earnings)
SELECT 
    u.id,
    N'Xe máy' as vehicle_type,
    N'51A-' + RIGHT('00000' + CAST(u.id AS VARCHAR), 5) as license_plate,
    N'Toàn thành phố' as delivery_area,
    1 as is_available,
    0.00 as rating,
    0 as total_deliveries,
    0.00 as total_earnings
FROM users u
LEFT JOIN shippers s ON u.id = s.user_id
WHERE u.role = 'shipper' AND s.id IS NULL;
*/
