GO

PRINT '===== Checking role_applications table =====';

-- Check if table exists
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'role_applications')
BEGIN
    PRINT '✓ Table role_applications EXISTS';
    
    -- Show table structure
    PRINT '';
    PRINT 'Table columns:';
    SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'role_applications'
    ORDER BY ORDINAL_POSITION;
    
    -- Show current data
    PRINT '';
    PRINT 'Current applications:';
    SELECT 
        id, 
        user_id, 
        requested_role, 
        status, 
        created_at,
        shop_name
    FROM role_applications
    ORDER BY created_at DESC;
    
    PRINT '';
    -- Get count separately to avoid subquery in PRINT
    DECLARE @appCount INT;
    SELECT @appCount = COUNT(*) FROM role_applications;
    PRINT 'Total applications: ' + CAST(@appCount AS VARCHAR(10));
END
ELSE
BEGIN
    PRINT '✗ Table role_applications DOES NOT EXIST';
    PRINT '';
    PRINT 'Creating table now...';
    
    -- Create the table
    CREATE TABLE [dbo].[role_applications](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [user_id] [int] NOT NULL,
        [requested_role] [nvarchar](50) NOT NULL,
        [status] [nvarchar](50) NOT NULL,
        [reason] [nvarchar](max) NULL,
        [admin_note] [nvarchar](max) NULL,
        [reviewed_by] [int] NULL,
        [created_at] [datetime2](7) NULL,
        [reviewed_at] [datetime2](7) NULL,
        [shop_name] [nvarchar](255) NULL,
        [shop_address] [nvarchar](max) NULL,
        [shop_description] [nvarchar](max) NULL,
        PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    -- Add foreign keys
    ALTER TABLE [dbo].[role_applications]  WITH CHECK 
    ADD FOREIGN KEY([user_id]) REFERENCES [dbo].[users] ([id]);
    
    ALTER TABLE [dbo].[role_applications]  WITH CHECK 
    ADD FOREIGN KEY([reviewed_by]) REFERENCES [dbo].[users] ([id]);
    
    -- Add constraints
    ALTER TABLE [dbo].[role_applications]  WITH CHECK 
    ADD CHECK (([status]='rejected' OR [status]='approved' OR [status]='pending'));
    
    ALTER TABLE [dbo].[role_applications]  WITH CHECK 
    ADD CHECK (([requested_role]='shipper' OR [requested_role]='seller'));
    
    PRINT '✓ Table created successfully!';
END
GO

PRINT '';
PRINT '===== Done =====';
