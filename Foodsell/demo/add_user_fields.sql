-- Add new columns to users table for profile information
-- Run this script on your database to add dateOfBirth, gender, and idNumber fields

USE [foodsell]
GO

-- Add date_of_birth column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'date_of_birth')
BEGIN
    ALTER TABLE [dbo].[users]
    ADD [date_of_birth] [date] NULL;
    PRINT 'Column date_of_birth added successfully';
END
ELSE
BEGIN
    PRINT 'Column date_of_birth already exists';
END
GO

-- Add gender column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'gender')
BEGIN
    ALTER TABLE [dbo].[users]
    ADD [gender] [nvarchar](10) NULL;
    PRINT 'Column gender added successfully';
END
ELSE
BEGIN
    PRINT 'Column gender already exists';
END
GO

-- Add id_number column (CMND/CCCD)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND name = 'id_number')
BEGIN
    ALTER TABLE [dbo].[users]
    ADD [id_number] [nvarchar](20) NULL;
    PRINT 'Column id_number added successfully';
END
ELSE
BEGIN
    PRINT 'Column id_number already exists';
END
GO

PRINT 'All user profile fields have been added successfully!';
GO
