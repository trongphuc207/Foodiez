-- Script để kiểm tra đầy đủ CHECK_CLAUSE của constraint
-- Xem toàn bộ các giá trị được phép

SELECT 
    cc.CONSTRAINT_NAME,
    cc.CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc
INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu 
    ON cc.CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
WHERE ccu.TABLE_NAME = 'notifications' 
    AND ccu.COLUMN_NAME = 'type';

-- Kiểm tra xem constraint có cho phép đầy đủ các giá trị không
-- Nên có: ORDER, PROMOTION, MESSAGE, DELIVERY, SYSTEM

