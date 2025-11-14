-- Add status column to reviews table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.reviews') AND name = 'status')
BEGIN
    ALTER TABLE reviews ADD status VARCHAR(20) DEFAULT 'PENDING';
    UPDATE reviews SET status = 'PENDING' WHERE status IS NULL;
END
GO

