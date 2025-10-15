-- Tạo bảng shippers để lưu thông tin chi tiết của shipper
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

-- Thêm trigger để tự động cập nhật updated_at
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

-- Thêm một số dữ liệu mẫu (optional)
INSERT INTO shippers (user_id, vehicle_type, license_plate, delivery_area, is_available, rating, total_deliveries, total_earnings)
VALUES 
    (1, N'Xe máy', N'51A-12345', N'Quận 1, Quận 3, Quận 5', 1, 4.5, 25, 1250000.00),
    (2, N'Xe đạp', N'51B-67890', N'Quận 2, Quận 7, Quận Thủ Đức', 1, 4.2, 18, 900000.00),
    (3, N'Ô tô', N'51C-11111', N'Toàn thành phố', 0, 4.8, 45, 2250000.00);

-- Kiểm tra dữ liệu
SELECT 
    s.id,
    u.full_name,
    u.phone,
    s.vehicle_type,
    s.license_plate,
    s.delivery_area,
    s.is_available,
    s.rating,
    s.total_deliveries,
    s.total_earnings,
    s.created_at
FROM shippers s
INNER JOIN users u ON s.user_id = u.id;
