import React, { useState } from 'react';
import { complaintAPI } from '../../api/complaint';
import { useAuth } from '../../hooks/useAuth';
import './Complaint.css';

const complaintTypes = [
  { value: 'INAPPROPRIATE_CONTENT', label: 'Nội dung không phù hợp' },
  { value: 'FAKE_REVIEW', label: 'Đánh giá giả mạo' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'OFFENSIVE_LANGUAGE', label: 'Ngôn ngữ xúc phạm' },
  { value: 'MISLEADING_INFORMATION', label: 'Thông tin sai lệch' },
  { value: 'OTHER', label: 'Khác' },
];

export default function ComplaintForm({ reviewId, onSuccess, onCancel }) {
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    complaintType: '',
    complaintReason: '',
    complaintDetails: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để gửi khiếu nại.');
      return;
    }

    if (!formData.complaintType || !formData.complaintReason.trim()) {
      alert('Vui lòng chọn loại và nhập lý do khiếu nại.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const complaintData = {
        complaintType: formData.complaintType,
        complaintReason: formData.complaintReason.trim(),
        complaintDetails: formData.complaintDetails.trim() || null
      };

      await complaintAPI.createComplaint(reviewId, complaintData);
      
      alert('Khiếu nại đã được gửi thành công!');
      
      // Reset form
      setFormData({
        complaintType: '',
        complaintReason: '',
        complaintDetails: ''
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Failed to submit complaint:', err);
      setError(err.response?.data?.message || 'Không thể gửi khiếu nại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complaint-form-container">
      <h3>Gửi khiếu nại về đánh giá</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="complaintType">Loại khiếu nại:</label>
          <select
            id="complaintType"
            name="complaintType"
            value={formData.complaintType}
            onChange={handleInputChange}
            required
          >
            <option value="">Chọn loại khiếu nại</option>
            {complaintTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="complaintReason">Lý do ngắn gọn:</label>
          <input
            type="text"
            id="complaintReason"
            name="complaintReason"
            value={formData.complaintReason}
            onChange={handleInputChange}
            placeholder="Ví dụ: Nội dung không phù hợp"
            maxLength={255}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="complaintDetails">Chi tiết (tùy chọn):</label>
          <textarea
            id="complaintDetails"
            name="complaintDetails"
            value={formData.complaintDetails}
            onChange={handleInputChange}
            placeholder="Cung cấp thêm chi tiết về khiếu nại..."
            rows={3}
            maxLength={1000}
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={onCancel}
            disabled={loading}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi khiếu nại'}
          </button>
        </div>
      </form>
    </div>
  );
}

