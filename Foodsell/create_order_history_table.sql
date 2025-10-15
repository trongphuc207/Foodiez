-- Tạo bảng order_history để lưu lịch sử thay đổi trạng thái đơn hàng
CREATE TABLE order_history (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    status_from NVARCHAR(50),
    status_to NVARCHAR(50) NOT NULL,
    action NVARCHAR(100) NOT NULL, -- payment_success, payment_failed, order_cancelled, etc.
    description NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    created_by NVARCHAR(100), -- system, user_id, admin_id
    
    -- Foreign key constraint
    CONSTRAINT FK_order_history_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Tạo index để tối ưu truy vấn
CREATE INDEX IX_order_history_order_id ON order_history(order_id);
CREATE INDEX IX_order_history_action ON order_history(action);
CREATE INDEX IX_order_history_status_to ON order_history(status_to);
CREATE INDEX IX_order_history_created_at ON order_history(created_at);

-- Thêm trigger để tự động cập nhật created_at
CREATE TRIGGER TR_order_history_created_at
ON order_history
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE order_history 
    SET created_at = GETDATE()
    FROM order_history oh
    INNER JOIN inserted i ON oh.id = i.id
    WHERE oh.created_at IS NULL;
END;

-- Thêm một số dữ liệu mẫu (optional)
INSERT INTO order_history (order_id, status_from, status_to, action, description, created_by)
VALUES 
    (1, NULL, 'pending', 'order_created', 'Order was created', 'system'),
    (1, 'pending', 'pending_payment', 'payment_initiated', 'Payment link created via PayOS', 'system'),
    (2, NULL, 'pending', 'order_created', 'Order was created', 'system'),
    (2, 'pending', 'paid', 'payment_success', 'Payment completed successfully via PayOS', 'system');

-- Kiểm tra dữ liệu
SELECT 
    oh.id,
    oh.order_id,
    oh.status_from,
    oh.status_to,
    oh.action,
    oh.description,
    oh.created_at,
    oh.created_by
FROM order_history oh
ORDER BY oh.created_at DESC;
