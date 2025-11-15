-- Script để sửa CHECK constraint trên bảng notifications
-- Tìm và xóa constraint cũ, đảm bảo chỉ có constraint mới

-- BƯỚC 1: Xem tất cả constraints trên cột type
SELECT 
    cc.CONSTRAINT_NAME,
    cc.CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc
INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu 
    ON cc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
WHERE ccu.TABLE_NAME = 'notifications' 
    AND ccu.COLUMN_NAME = 'type';

-- BƯỚC 2: Xóa constraint cũ (lowercase) nếu tồn tại
-- Thử với tên đầy đủ từ kết quả query trên
IF EXISTS (
    SELECT 1 
    FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS 
    WHERE CONSTRAINT_NAME = 'CK_notificati_type_3E1D39E1'
)
BEGIN
    ALTER TABLE notifications
    DROP CONSTRAINT CK_notificati_type_3E1D39E1;
    PRINT 'Đã xóa constraint CK_notificati_type_3E1D39E1';
END
ELSE
BEGIN
    PRINT 'Constraint CK_notificati_type_3E1D39E1 không tồn tại';
END;

-- BƯỚC 3: Xóa tất cả constraints trên cột type (trừ constraint mới nếu đã có)
-- Lấy tên constraint động
DECLARE @constraintName NVARCHAR(255);
DECLARE @sql NVARCHAR(MAX);

-- Tìm constraint có CHECK_CLAUSE chứa lowercase values
DECLARE constraint_cursor CURSOR FOR
SELECT cc.CONSTRAINT_NAME
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc
INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu 
    ON cc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
WHERE ccu.TABLE_NAME = 'notifications' 
    AND ccu.COLUMN_NAME = 'type'
    AND (cc.CHECK_CLAUSE LIKE '%admin_message%' 
         OR cc.CHECK_CLAUSE LIKE '%promotion%' 
         OR cc.CHECK_CLAUSE LIKE '%order_update%');

OPEN constraint_cursor;
FETCH NEXT FROM constraint_cursor INTO @constraintName;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = 'ALTER TABLE notifications DROP CONSTRAINT ' + QUOTENAME(@constraintName);
    EXEC sp_executesql @sql;
    PRINT 'Đã xóa constraint: ' + @constraintName;
    FETCH NEXT FROM constraint_cursor INTO @constraintName;
END;

CLOSE constraint_cursor;
DEALLOCATE constraint_cursor;

-- BƯỚC 4: Đảm bảo constraint mới tồn tại (uppercase values)
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

-- BƯỚC 5: Kiểm tra lại constraints sau khi sửa
SELECT 
    cc.CONSTRAINT_NAME,
    cc.CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc
INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu 
    ON cc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
WHERE ccu.TABLE_NAME = 'notifications' 
    AND ccu.COLUMN_NAME = 'type';
