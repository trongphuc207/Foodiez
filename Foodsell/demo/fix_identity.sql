-- Fix IDENTITY seed and check current data
USE Foodiez;
GO

-- Check current max ID and table data
SELECT MAX(id) as MaxID, COUNT(*) as TotalUsers FROM users;
SELECT id, email, role FROM users ORDER BY id;

-- Reseed IDENTITY to correct value (should be MAX(id) + 1)
DECLARE @maxId INT;
SELECT @maxId = ISNULL(MAX(id), 0) FROM users;
DBCC CHECKIDENT ('users', RESEED, @maxId);
GO

-- Now check identity info
SELECT 
    IDENT_CURRENT('users') as CurrentIdentity,
    IDENT_INCR('users') as IdentityIncrement,
    IDENT_SEED('users') as IdentitySeed;
GO
