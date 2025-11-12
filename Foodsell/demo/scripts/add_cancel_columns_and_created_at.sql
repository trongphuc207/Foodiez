-- Migration: add created_at (if not exists) and cancellation columns to orders
-- Run with: sqlcmd -S localhost,1433 -U sa -P 1234 -d food_delivery_db10 -i add_cancel_columns_and_created_at.sql

BEGIN TRY
    PRINT 'Adding created_at column if not exists';
    IF COL_LENGTH('dbo.orders', 'created_at') IS NULL
    BEGIN
        ALTER TABLE dbo.[orders]
        ADD created_at DATETIME2 NOT NULL CONSTRAINT DF_orders_created_at DEFAULT SYSUTCDATETIME();
    END
    ELSE
    BEGIN
        PRINT 'Column created_at already exists';
    END

    PRINT 'Adding cancellation columns if not exists';
    IF COL_LENGTH('dbo.orders', 'is_cancelled') IS NULL
    BEGIN
        ALTER TABLE dbo.[orders]
        ADD is_cancelled BIT NOT NULL CONSTRAINT DF_orders_is_cancelled DEFAULT 0,
            cancelled_at DATETIME2 NULL,
            cancelled_by INT NULL,
            cancel_reason NVARCHAR(MAX) NULL;
    END
    ELSE
    BEGIN
        PRINT 'Cancellation columns already exist';
    END

    PRINT 'Migration completed';
END TRY
BEGIN CATCH
    PRINT 'Error during migration: ' + ERROR_MESSAGE();
    THROW;
END CATCH
