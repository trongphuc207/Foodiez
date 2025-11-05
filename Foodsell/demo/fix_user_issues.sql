-- ===== FIX USER ISSUES =====
-- 1. Check current database state
-- 2. Fix IDENTITY seed issue (1009 instead of 9-10)
-- 3. Update role for user id=10

USE Foodiez;
GO

PRINT '===== STEP 1: Check current state =====';
SELECT 
    MAX(id) as MaxUserID, 
    COUNT(*) as TotalUsers,
    IDENT_CURRENT('users') as CurrentIdentity,
    IDENT_INCR('users') as IdentityIncrement,
    IDENT_SEED('users') as IdentitySeed
FROM users;
GO

PRINT '===== Current users (last 5) =====';
SELECT TOP 5 id, email, role, created_at 
FROM users 
ORDER BY id DESC;
GO

PRINT '===== STEP 2: Reseed IDENTITY to correct value =====';
-- Get max ID and reseed
DECLARE @maxId INT;
SELECT @maxId = ISNULL(MAX(id), 0) FROM users;
PRINT 'Max ID found: ' + CAST(@maxId AS VARCHAR(10));

-- Reseed IDENTITY to max + 1
DBCC CHECKIDENT ('users', RESEED, @maxId);
PRINT 'IDENTITY reseeded to: ' + CAST(@maxId AS VARCHAR(10));
GO

-- Verify new seed
SELECT 
    IDENT_CURRENT('users') as CurrentIdentity,
    'Next ID will be: ' + CAST(IDENT_CURRENT('users') + 1 AS VARCHAR(10)) as NextID;
GO

PRINT '===== STEP 3: Update role for user id=10 (if exists) =====';
IF EXISTS (SELECT 1 FROM users WHERE id = 10)
BEGIN
    -- Check if user has new profile columns
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'date_of_birth')
    BEGIN
        PRINT 'User id=10 found. Updating role to admin...';
        UPDATE users 
        SET role = 'admin', 
            updated_at = GETDATE()
        WHERE id = 10;
        PRINT 'Role updated successfully!';
    END
    ELSE
    BEGIN
        PRINT 'Warning: Profile columns not added yet. Run add_user_fields.sql first';
    END
END
ELSE
BEGIN
    PRINT 'User id=10 does not exist yet.';
END
GO

PRINT '===== STEP 4: Final verification =====';
SELECT id, email, role, updated_at 
FROM users 
WHERE id IN (8, 9, 10, 1009, 1010)
ORDER BY id;
GO

PRINT '===== Done! =====';
PRINT 'Next user created will have ID = ' + CAST(IDENT_CURRENT('users') + 1 AS VARCHAR(10));
GO
