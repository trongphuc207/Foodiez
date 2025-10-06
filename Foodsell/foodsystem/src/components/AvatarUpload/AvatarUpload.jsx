import React, { useState, useRef } from 'react';
import './AvatarUpload.css';

const AvatarUpload = ({ currentAvatar, onAvatarChange, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clear previous errors
    setError('');

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Vui lòng chọn file ảnh (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.onerror = () => {
      setError('Không thể đọc file ảnh');
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn ảnh');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Vui lòng đăng nhập để upload avatar');
        return;
      }

      const response = await fetch('http://localhost:8080/api/auth/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Có lỗi xảy ra khi upload';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `Server error: ${response.status}`;
        }
        setError(errorMessage);
        return;
      }

      const result = await response.json();
      console.log('📤 Upload result:', result);

      if (result.success) {
        console.log('✅ Upload successful, calling onAvatarChange with:', result.data.profileImage);
        onAvatarChange(result.data.profileImage);
        alert('Cập nhật avatar thành công!');
        onClose();
      } else {
        setError(result.message || 'Có lỗi xảy ra khi upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Có lỗi xảy ra khi upload ảnh. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setError('');
    onClose();
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa avatar?')) {
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/auth/remove-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        onAvatarChange(null);
        alert('Đã xóa avatar thành công!');
        onClose();
      } else {
        setError(result.message || 'Có lỗi xảy ra khi xóa avatar');
      }
    } catch (error) {
      console.error('Remove avatar error:', error);
      setError('Có lỗi xảy ra khi xóa avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-upload-overlay" onClick={onClose}>
      <div className="avatar-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-upload-header">
          <h3>Thay đổi Avatar</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="avatar-upload-content">
          <div className="current-avatar-section">
            <h4>Ảnh hiện tại:</h4>
            <div className="current-avatar">
              <img 
                src={currentAvatar ? (currentAvatar.startsWith('http') ? currentAvatar : `http://localhost:8080/${currentAvatar}`) : '/placeholder-user.jpg'} 
                alt="Current Avatar"
                className="current-avatar-img"
              />
            </div>
            {currentAvatar && (
              <button 
                className="remove-avatar-btn"
                onClick={handleRemoveAvatar}
                disabled={uploading}
              >
                🗑️ Xóa Avatar
              </button>
            )}
          </div>

          <div className="upload-section">
            <h4>Chọn ảnh mới:</h4>
            
            <div className="file-input-area" onClick={() => fileInputRef.current?.click()}>
              {preview ? (
                <div className="preview-container">
                  <img src={preview} alt="Preview" className="preview-img" />
                  <div className="preview-overlay">
                    <span>Click để chọn ảnh khác</span>
                  </div>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">📷</div>
                  <p>Click để chọn ảnh</p>
                  <p className="upload-hint">JPG, PNG, GIF (tối đa 5MB)</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="upload-actions">
              <button 
                className="cancel-btn"
                onClick={handleCancel}
                disabled={uploading}
              >
                Hủy
              </button>
              <button 
                className="upload-btn"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Đang upload...' : 'Cập nhật Avatar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
