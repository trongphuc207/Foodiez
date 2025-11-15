-- Script để kiểm tra CHECK constraint trên bảng notifications

-- 1. Xem tất cả CHECK constraints trên bảng notifications
SELECT 
    cc.CONSTRAINT_NAME,
    cc.CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc
INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu 
    ON cc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
WHERE ccu.TABLE_NAME = 'notifications' 
    AND ccu.COLUMN_NAME = 'type';

-- 2. Xem tất cả constraints trên bảng notifications
SELECT 
    tc.CONSTRAINT_NAME,
    tc.CONSTRAINT_TYPE,
    cc.CHECK_CLAUSE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
LEFT JOIN INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc 
    ON tc.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
WHERE tc.TABLE_NAME = 'notifications';

-- 3. Xem các giá trị type hiện có trong bảng
SELECT DISTINCT type, COUNT(*) as count
FROM notifications
GROUP BY type
ORDER BY type;
