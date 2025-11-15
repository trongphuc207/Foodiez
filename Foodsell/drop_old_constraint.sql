-- Script đơn giản để xóa constraint cũ CK_notificati_type_3E1D39E1
-- Chạy script này để xóa constraint có lowercase values

-- Xóa constraint cũ trực tiếp bằng tên
BEGIN TRY
    ALTER TABLE notifications
    DROP CONSTRAINT CK_notificati_type_3E1D39E1;
    PRINT '✅ Đã xóa thành công constraint CK_notificati_type_3E1D39E1';
END TRY
BEGIN CATCH
    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    PRINT '❌ Lỗi khi xóa constraint: ' + @ErrorMessage;
    
    -- Thử tìm và xóa bằng cách khác
    DECLARE @constraintName NVARCHAR(255);
    DECLARE @sql NVARCHAR(MAX);
    
    SELECT @constraintName = cc.CONSTRAINT_NAME
    FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc
    INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu 
        ON cc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
    WHERE ccu.TABLE_NAME = 'notifications' 
        AND ccu.COLUMN_NAME = 'type'
        AND cc.CONSTRAINT_NAME = 'CK_notificati_type_3E1D39E1';
    
    IF @constraintName IS NOT NULL
    BEGIN
        SET @sql = 'ALTER TABLE notifications DROP CONSTRAINT ' + QUOTENAME(@constraintName);
        EXEC sp_executesql @sql;
        PRINT '✅ Đã xóa constraint bằng dynamic SQL: ' + @constraintName;
    END
    ELSE
    BEGIN
        PRINT '⚠️ Không tìm thấy constraint CK_notificati_type_3E1D39E1';
    END
END CATCH;

-- Kiểm tra lại constraints sau khi xóa
PRINT '';
PRINT '📋 Kiểm tra constraints còn lại:';
SELECT 
    cc.CONSTRAINT_NAME,
    cc.CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc
INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu 
    ON cc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
WHERE ccu.TABLE_NAME = 'notifications' 
    AND ccu.COLUMN_NAME = 'type';

