-- Script để thay đổi cột rating từ Double sang Integer
-- Chạy script này trong SQL Server Management Studio

USE food_delivery_db6;
GO

-- 1. Xóa tất cả constraint DEFAULT cho cột rating
DECLARE @constraint_name NVARCHAR(128);
DECLARE @sql NVARCHAR(MAX);

-- Xóa constraint cho bảng shops
SELECT @constraint_name = name 
FROM sys.default_constraints 
WHERE parent_object_id = OBJECT_ID('shops') 
AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('shops'), 'rating', 'ColumnId');

IF @constraint_name IS NOT NULL
BEGIN
    SET @sql = 'ALTER TABLE shops DROP CONSTRAINT ' + @constraint_name;
    EXEC sp_executesql @sql;
    PRINT 'Đã xóa constraint shops: ' + @constraint_name;
END

-- Xóa constraint cho bảng shippers
SELECT @constraint_name = name 
FROM sys.default_constraints 
WHERE parent_object_id = OBJECT_ID('shippers') 
AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('shippers'), 'rating', 'ColumnId');

IF @constraint_name IS NOT NULL
BEGIN
    SET @sql = 'ALTER TABLE shippers DROP CONSTRAINT ' + @constraint_name;
    EXEC sp_executesql @sql;
    PRINT 'Đã xóa constraint shippers: ' + @constraint_name;
END

-- Xóa constraint cho bảng reviews
SELECT @constraint_name = name 
FROM sys.default_constraints 
WHERE parent_object_id = OBJECT_ID('reviews') 
AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('reviews'), 'rating', 'ColumnId');

IF @constraint_name IS NOT NULL
BEGIN
    SET @sql = 'ALTER TABLE reviews DROP CONSTRAINT ' + @constraint_name;
    EXEC sp_executesql @sql;
    PRINT 'Đã xóa constraint reviews: ' + @constraint_name;
END

-- 2. Thay đổi kiểu dữ liệu cột rating trong bảng shops
ALTER TABLE shops ALTER COLUMN rating INT;
PRINT 'Đã thay đổi cột rating trong bảng shops thành INT';

-- 3. Thay đổi kiểu dữ liệu cột rating trong bảng shippers
ALTER TABLE shippers ALTER COLUMN rating INT;
PRINT 'Đã thay đổi cột rating trong bảng shippers thành INT';

-- 4. Thay đổi kiểu dữ liệu cột rating trong bảng reviews (nếu cần)
ALTER TABLE reviews ALTER COLUMN rating INT;
PRINT 'Đã thay đổi cột rating trong bảng reviews thành INT';

-- 5. Cập nhật dữ liệu hiện có (làm tròn rating về số nguyên)
UPDATE shops SET rating = CAST(ROUND(CAST(rating AS FLOAT), 0) AS INT) WHERE rating IS NOT NULL;
UPDATE shippers SET rating = CAST(ROUND(CAST(rating AS FLOAT), 0) AS INT) WHERE rating IS NOT NULL;
UPDATE reviews SET rating = CAST(ROUND(CAST(rating AS FLOAT), 0) AS INT) WHERE rating IS NOT NULL;

PRINT 'Đã cập nhật dữ liệu rating thành số nguyên';

-- 6. Thêm constraint CHECK để đảm bảo rating từ 1-5 (nếu chưa có)
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_reviews_rating')
BEGIN
    ALTER TABLE reviews ADD CONSTRAINT CK_reviews_rating CHECK (rating >= 1 AND rating <= 5);
    PRINT 'Đã thêm constraint CHECK cho reviews';
END

IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_shops_rating')
BEGIN
    ALTER TABLE shops ADD CONSTRAINT CK_shops_rating CHECK (rating >= 1 AND rating <= 5);
    PRINT 'Đã thêm constraint CHECK cho shops';
END

IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_shippers_rating')
BEGIN
    ALTER TABLE shippers ADD CONSTRAINT CK_shippers_rating CHECK (rating >= 1 AND rating <= 5);
    PRINT 'Đã thêm constraint CHECK cho shippers';
END

PRINT 'Hoàn thành cập nhật cột rating!';
