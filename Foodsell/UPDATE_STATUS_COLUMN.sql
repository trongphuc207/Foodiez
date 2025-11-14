-- SQL Script to update status column in reviews table
-- Run this script to ensure status column has proper default value and constraint

-- 1. Ensure default value is set
IF EXISTS (
    SELECT * 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'dbo.reviews') 
    AND name = 'status'
)
BEGIN
    -- Update existing NULL values to PENDING
    UPDATE reviews 
    SET status = 'PENDING' 
    WHERE status IS NULL;
    
    -- Add default constraint if not exists
    IF NOT EXISTS (
        SELECT * 
        FROM sys.default_constraints 
        WHERE parent_object_id = OBJECT_ID(N'dbo.reviews') 
        AND name LIKE '%status%'
    )
    BEGIN
        ALTER TABLE reviews 
        ADD CONSTRAINT DF_reviews_status DEFAULT 'PENDING' FOR status;
        
        PRINT 'Default constraint added to status column';
    END
    ELSE
    BEGIN
        PRINT 'Default constraint already exists for status column';
    END
    
    PRINT 'Status column updated successfully';
END
ELSE
BEGIN
    PRINT 'Status column does not exist. Please run ADD_STATUS_COLUMN.sql first.';
END
GO

