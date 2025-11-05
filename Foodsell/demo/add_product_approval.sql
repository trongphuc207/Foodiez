-- Add product approval system
GO

PRINT '===== Adding product approval columns =====';

-- Add approval_status column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[products]') AND name = 'approval_status')
BEGIN
    ALTER TABLE products
    ADD [approval_status] NVARCHAR(20) NOT NULL DEFAULT 'pending';
    PRINT '✓ Column approval_status added';
END
ELSE
BEGIN
    PRINT '✓ Column approval_status already exists';
END
GO

-- Add admin_note column for rejection reason
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[products]') AND name = 'admin_note')
BEGIN
    ALTER TABLE products
    ADD [admin_note] NVARCHAR(MAX) NULL;
    PRINT '✓ Column admin_note added';
END
ELSE
BEGIN
    PRINT '✓ Column admin_note already exists';
END
GO

-- Add reviewed_by column (admin ID)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[products]') AND name = 'reviewed_by')
BEGIN
    ALTER TABLE products
    ADD [reviewed_by] INT NULL;
    PRINT '✓ Column reviewed_by added';
END
ELSE
BEGIN
    PRINT '✓ Column reviewed_by already exists';
END
GO

-- Add reviewed_at column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[products]') AND name = 'reviewed_at')
BEGIN
    ALTER TABLE products
    ADD [reviewed_at] DATETIME2(7) NULL;
    PRINT '✓ Column reviewed_at added';
END
ELSE
BEGIN
    PRINT '✓ Column reviewed_at already exists';
END
GO

-- Update existing products to 'approved' so they show immediately
UPDATE products 
SET approval_status = 'approved'
WHERE approval_status = 'pending' OR approval_status IS NULL;
PRINT '✓ Existing products set to approved';
GO

-- Add constraint for approval_status
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_products_approval_status')
BEGIN
    ALTER TABLE products
    ADD CONSTRAINT CK_products_approval_status 
    CHECK (approval_status IN ('pending', 'approved', 'rejected'));
    PRINT '✓ Constraint CK_products_approval_status added';
END
ELSE
BEGIN
    PRINT '✓ Constraint CK_products_approval_status already exists';
END
GO

PRINT '';
PRINT '===== Product approval system ready! =====';
PRINT 'New products will default to "pending" status';
PRINT 'Existing products have been set to "approved"';
GO
