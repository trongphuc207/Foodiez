import React, { useState } from 'react';
import './BannedAccountModal.css';

const BannedAccountModal = ({ userData, onClose }) => {
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    description: '',
    category: 'account_ban',
    evidence: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    
    if (!complaintForm.title.trim() || !complaintForm.description.trim()) {
      alert('Vui lòng điền đầy đủ thông tin khiếu nại');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create complaint for banned user (no token required)
      const complaintData = {
        complainantId: userData.id,
        respondentId: null, // Khiếu nại về admin/system
        subject: complaintForm.title,
        description: complaintForm.description,
        category: 'account_ban',
        priority: 'high'
      };

      console.log('Sending banned user complaint:', complaintData);

      // Use special endpoint for banned users (no Authorization header)
      const response = await fetch('http://localhost:8080/api/complaints/banned-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complaintData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to create complaint: ${response.status} - ${errorText}`);
      }

      // Get response text first to debug
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      // Try to parse JSON
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Complaint created:', result);
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        console.error('Response was:', responseText);
        throw new Error('Server returned invalid JSON response');
      }

      const complaintId = result.data.id;

      // Upload images if any (use banned user endpoint)
      if (complaintForm.evidence.length > 0) {
        for (const file of complaintForm.evidence) {
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadResponse = await fetch(`http://localhost:8080/api/complaints/${complaintId}/upload-image-banned`, {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            console.error('Failed to upload image:', file.name);
          }
        }
      }

      alert('Đơn khiếu nại đã được gửi thành công! Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.');
      onClose();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Lỗi khi gửi đơn khiếu nại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setComplaintForm({ ...complaintForm, evidence: files });
  };

  return (
    <div className="banned-modal-overlay" onClick={onClose}>
      <div className="banned-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="banned-modal-close" onClick={onClose}>×</button>
        
        {!showComplaintForm ? (
          <>
            <div className="banned-modal-icon">🚫</div>
            <h2 className="banned-modal-title">Tài khoản đã bị khóa</h2>
            <p className="banned-modal-message">
              Tài khoản của bạn (<strong>{userData?.email}</strong>) đã bị khóa bởi quản trị viên.
            </p>
            <p className="banned-modal-submessage">
              Nếu bạn cho rằng đây là một sai lầm, vui lòng gửi đơn khiếu nại kèm bằng chứng để chúng tôi xem xét lại.
            </p>
            
            <div className="banned-modal-actions">
              <button 
                className="btn-complaint" 
                onClick={() => setShowComplaintForm(true)}
              >
                📝 Gửi đơn khiếu nại
              </button>
              <button className="btn-cancel" onClick={onClose}>
                Đóng
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="banned-modal-title">Gửi đơn khiếu nại</h2>
            <form onSubmit={handleSubmitComplaint} className="complaint-form">
              <div className="form-group">
                <label>Tiêu đề khiếu nại *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Tài khoản bị khóa nhầm"
                  value={complaintForm.title}
                  onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                  required
                  maxLength="200"
                />
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết *</label>
                <textarea
                  className="form-control"
                  rows="5"
                  placeholder="Vui lòng mô tả chi tiết lý do bạn cho rằng tài khoản bị khóa nhầm và cung cấp bằng chứng..."
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Bằng chứng (hình ảnh)</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
                <small className="form-text">Có thể chọn nhiều ảnh làm bằng chứng</small>
                {complaintForm.evidence.length > 0 && (
                  <div className="selected-files">
                    <strong>Đã chọn {complaintForm.evidence.length} ảnh:</strong>
                    <ul>
                      {Array.from(complaintForm.evidence).map((file, idx) => (
                        <li key={idx}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '⏳ Đang gửi...' : '✉️ Gửi đơn khiếu nại'}
                </button>
                <button 
                  type="button" 
                  className="btn-back" 
                  onClick={() => setShowComplaintForm(false)}
                  disabled={isSubmitting}
                >
                  ← Quay lại
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default BannedAccountModal;
