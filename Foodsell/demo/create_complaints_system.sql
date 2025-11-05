-- Create Complaints System
USE Foodiez;
GO

-- Create complaints table
CREATE TABLE complaints (
    id INT IDENTITY(1,1) PRIMARY KEY,
    complaint_number VARCHAR(20) UNIQUE NOT NULL, -- Format: CPL-YYYYMMDD-XXXXX
    complainant_id INT NOT NULL, -- User who files the complaint
    complainant_type VARCHAR(20) NOT NULL, -- 'customer', 'seller', 'shipper'
    respondent_id INT, -- User being complained about (nullable for system complaints)
    respondent_type VARCHAR(20), -- 'customer', 'seller', 'shipper', 'admin', 'system'
    category VARCHAR(50) NOT NULL, -- 'product_quality', 'delivery_issue', 'seller_service', 'payment_issue', 'account_ban', 'other'
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'under_review', 'resolved', 'rejected'
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Admin handling
    assigned_admin_id INT, -- Admin handling this complaint
    admin_note TEXT,
    admin_decision VARCHAR(20), -- 'approved', 'rejected', 'needs_more_info'
    decision_reason TEXT,
    
    -- Related order/product (optional)
    related_order_id INT,
    related_product_id INT,
    
    -- Timestamps
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    resolved_at DATETIME,
    
    FOREIGN KEY (complainant_id) REFERENCES users(id),
    FOREIGN KEY (respondent_id) REFERENCES users(id),
    FOREIGN KEY (assigned_admin_id) REFERENCES users(id)
);
GO

-- Create complaint_images table for evidence photos
CREATE TABLE complaint_images (
    id INT IDENTITY(1,1) PRIMARY KEY,
    complaint_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_type VARCHAR(20) DEFAULT 'evidence', -- 'evidence', 'product', 'delivery', 'other'
    description VARCHAR(200),
    uploaded_at DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);
GO

-- Create complaint_responses table for conversation between users and admin
CREATE TABLE complaint_responses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    complaint_id INT NOT NULL,
    user_id INT NOT NULL,
    user_role VARCHAR(20) NOT NULL, -- 'admin', 'customer', 'seller', 'shipper'
    message TEXT NOT NULL,
    is_internal_note BIT DEFAULT 0, -- Only visible to admins
    created_at DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

-- Create indexes for performance
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_complainant ON complaints(complainant_id);
CREATE INDEX idx_complaints_respondent ON complaints(respondent_id);
CREATE INDEX idx_complaints_created ON complaints(created_at DESC);
CREATE INDEX idx_complaint_images_complaint ON complaint_images(complaint_id);
CREATE INDEX idx_complaint_responses_complaint ON complaint_responses(complaint_id);
GO

-- Create function to generate complaint number
CREATE FUNCTION dbo.GenerateComplaintNumber()
RETURNS VARCHAR(20)
AS
BEGIN
    DECLARE @date VARCHAR(8) = CONVERT(VARCHAR(8), GETDATE(), 112); -- YYYYMMDD
    DECLARE @count INT;
    DECLARE @number VARCHAR(20);
    
    -- Get count of complaints today
    SELECT @count = COUNT(*) + 1 
    FROM complaints 
    WHERE CONVERT(DATE, created_at) = CONVERT(DATE, GETDATE());
    
    SET @number = 'CPL-' + @date + '-' + RIGHT('00000' + CAST(@count AS VARCHAR(5)), 5);
    
    RETURN @number;
END;
GO

-- Add trigger to auto-generate complaint number
CREATE TRIGGER trg_GenerateComplaintNumber
ON complaints
AFTER INSERT
AS
BEGIN
    UPDATE complaints
    SET complaint_number = dbo.GenerateComplaintNumber()
    WHERE id IN (SELECT id FROM inserted) AND complaint_number IS NULL;
END;
GO

-- Insert sample complaint categories lookup (optional reference table)
CREATE TABLE complaint_categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    category_code VARCHAR(50) UNIQUE NOT NULL,
    category_name_vi NVARCHAR(100) NOT NULL,
    category_name_en VARCHAR(100) NOT NULL,
    description NVARCHAR(200),
    is_active BIT DEFAULT 1
);
GO

INSERT INTO complaint_categories (category_code, category_name_vi, category_name_en, description) VALUES
('product_quality', N'Chất lượng sản phẩm', 'Product Quality', N'Sản phẩm không đúng mô tả, hỏng hóc'),
('delivery_issue', N'Vấn đề giao hàng', 'Delivery Issue', N'Giao hàng chậm, shipper thái độ không tốt'),
('seller_service', N'Dịch vụ người bán', 'Seller Service', N'Người bán hỗ trợ kém, thái độ không tốt'),
('shipper_service', N'Dịch vụ shipper', 'Shipper Service', N'Shipper giao hàng không đúng, thái độ xấu'),
('payment_issue', N'Vấn đề thanh toán', 'Payment Issue', N'Sai số tiền, chưa nhận tiền hoàn'),
('account_ban', N'Khiếu nại khóa tài khoản', 'Account Ban Appeal', N'Tài khoản bị khóa oan, yêu cầu mở lại'),
('fraud_scam', N'Lừa đảo', 'Fraud/Scam', N'Nghi ngờ gian lận, lừa đảo'),
('other', N'Khác', 'Other', N'Vấn đề khác');
GO

PRINT 'Complaints system tables created successfully!';
