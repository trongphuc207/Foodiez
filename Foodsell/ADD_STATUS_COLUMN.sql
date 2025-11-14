-- SQL Script to add status column to reviews table
-- Run this script on your SQL Server database

-- Check if column exists and add if not
IF NOT EXISTS (
    SELECT * 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'dbo.reviews') 
    AND name = 'status'
)
BEGIN
    ALTER TABLE reviews 
    ADD status VARCHAR(20) DEFAULT 'PENDING';
    
    -- Update existing reviews to have PENDING status
    UPDATE reviews 
    SET status = 'PENDING' 
    WHERE status IS NULL;
    
    PRINT 'Column status added successfully to reviews table';
END
ELSE
BEGIN
    PRINT 'Column status already exists in reviews table';
END
GO

