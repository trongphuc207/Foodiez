-- Script đơn giản để xóa constraint cũ và đảm bảo constraint mới

-- BƯỚC 1: Xem tất cả constraints hiện tại
SELECT 
    cc.CONSTRAINT_NAME,
    cc.CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc
INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu 
    ON cc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
WHERE ccu.TABLE_NAME = 'notifications' 
    AND ccu.COLUMN_NAME = 'type';

-- BƯỚC 2: Xóa constraint có lowercase values (admin_message, promotion, order_update)
-- Script này sẽ tự động tìm và xóa constraint dựa trên nội dung CHECK_CLAUSE
DECLARE @sql NVARCHAR(MAX);
DECLARE @constraintName NVARCHAR(255);

-- Tìm constraint có chứa lowercase values
SELECT @constraintName = cc.CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc
INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu 
    ON cc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
WHERE ccu.TABLE_NAME = 'notifications' 
    AND ccu.COLUMN_NAME = 'type'
    AND (cc.CHECK_CLAUSE LIKE '%admin_message%' 
         OR cc.CHECK_CLAUSE LIKE '%''promotion''%' 
         OR cc.CHECK_CLAUSE LIKE '%order_update%');

-- Nếu tìm thấy, xóa nó
IF @constraintName IS NOT NULL
BEGIN
    SET @sql = 'ALTER TABLE notifications DROP CONSTRAINT ' + QUOTENAME(@constraintName);
    EXEC sp_executesql @sql;
    PRINT 'Đã xóa constraint: ' + @constraintName;
END
ELSE
BEGIN
    PRINT 'Không tìm thấy constraint cần xóa';
END;

-- BƯỚC 3: Đảm bảo constraint mới tồn tại
IF NOT EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS 
    WHERE CONSTRAINT_NAME = 'CK_notifications_type'
)
BEGIN
    ALTER TABLE notifications
    ADD CONSTRAINT CK_notifications_type 
    CHECK (type IN ('ORDER', 'PROMOTION', 'MESSAGE', 'DELIVERY', 'SYSTEM'));
    PRINT 'Đã tạo constraint CK_notifications_type';
END
ELSE
BEGIN
    PRINT 'Constraint CK_notifications_type đã tồn tại';
END;

-- BƯỚC 4: Kiểm tra lại
SELECT 
    cc.CONSTRAINT_NAME,
    cc.CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc
INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu 
    ON cc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
WHERE ccu.TABLE_NAME = 'notifications' 
    AND ccu.COLUMN_NAME = 'type';

