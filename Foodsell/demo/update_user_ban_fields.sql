-- =============================================
-- Add status and banned columns for ban functionality
-- =============================================
USE food_delivery_db6;
GO

PRINT '===== Adding user ban columns =====';

-- Add status column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'status')
BEGIN
    ALTER TABLE [dbo].[users]
    ADD [status] NVARCHAR(20) NULL DEFAULT 'ACTIVE';
    PRINT '✓ Column status added';
    
    -- Update existing records
    UPDATE [dbo].[users] 
    SET status = CASE 
        WHEN ISNULL(is_banned, 0) = 1 THEN 'BANNED'
        ELSE 'ACTIVE'
    END
    WHERE status IS NULL;
    PRINT '✓ Existing users status updated based on is_banned field';
END
ELSE
BEGIN
    PRINT '✓ Column status already exists';
END
GO

-- Add banned column (different from is_banned)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'banned')
BEGIN
    ALTER TABLE [dbo].[users]
    ADD [banned] BIT NULL DEFAULT 0;
    PRINT '✓ Column banned added';
    
    -- Sync with is_banned field
    UPDATE [dbo].[users] 
    SET banned = ISNULL(is_banned, 0)
    WHERE banned IS NULL;
    PRINT '✓ Existing users banned field synced with is_banned';
END
ELSE
BEGIN
    PRINT '✓ Column banned already exists';
END
GO

-- Add constraint for status
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_users_status')
BEGIN
    ALTER TABLE [dbo].[users]
    ADD CONSTRAINT CK_users_status 
    CHECK (status IN ('ACTIVE', 'BANNED', 'SUSPENDED', 'PENDING'));
    PRINT '✓ Constraint CK_users_status added';
END
ELSE
BEGIN
    PRINT '✓ Constraint CK_users_status already exists';
END
GO

PRINT '';
PRINT '===== User ban system ready! =====';
PRINT 'Users can now be banned using status and banned columns';
PRINT 'Backend will check these fields during login (both normal and Google OAuth)';
GO

-- Display current users with ban status
PRINT '';
PRINT '===== Current users ban status =====';
SELECT 
    id, 
    email, 
    full_name,
    role,
    ISNULL(status, 'NULL') as status,
    ISNULL(CAST(banned AS VARCHAR), 'NULL') as banned,
    ISNULL(CAST(is_banned AS VARCHAR), 'NULL') as is_banned
FROM users
ORDER BY id;
GO
