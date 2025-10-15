import React, { useState } from 'react';
import { productAPI } from '../../api/product';
import './ImageUpload.css';

const ImageUpload = ({ productId, currentImageUrl, onImageUpdate }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file ảnh');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Kích thước file quá lớn. Tối đa 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !productId) return;

    setUploading(true);
    setError(null);

    try {
      const result = await productAPI.uploadProductImage(productId, selectedFile);
      
      if (result.success) {
        // Call callback to update parent component
        if (onImageUpdate) {
          onImageUpdate(result.data.imageUrl);
        }
        
        // Reset form
        setSelectedFile(null);
        setPreviewUrl(null);
        
        alert('Upload ảnh thành công!');
      } else {
        setError(result.message || 'Upload thất bại');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi upload');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!productId) return;

    if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) return;

    setUploading(true);
    setError(null);

    try {
      const result = await productAPI.removeProductImage(productId);
      
      if (result.success) {
        // Call callback to update parent component
        if (onImageUpdate) {
          onImageUpdate(null);
        }
        
        alert('Xóa ảnh thành công!');
      } else {
        setError(result.message || 'Xóa ảnh thất bại');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi xóa ảnh');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload-container">
      <div className="image-upload-header">
        <h3>Quản lý ảnh sản phẩm</h3>
      </div>

      {/* Current Image Display */}
      {currentImageUrl && (
        <div className="current-image-section">
          <h4>Ảnh hiện tại:</h4>
          <div className="current-image">
            <img 
              src={currentImageUrl} 
              alt="Current product" 
              className="current-image-preview"
            />
            <button 
              className="remove-image-btn"
              onClick={handleRemoveImage}
              disabled={uploading}
            >
              🗑️ Xóa ảnh
            </button>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="upload-section">
        <h4>Upload ảnh mới:</h4>
        
        <div className="file-input-container">
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
            disabled={uploading}
          />
          <label htmlFor="image-upload" className="file-input-label">
            📁 Chọn ảnh
          </label>
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="preview-section">
            <h5>Xem trước:</h5>
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="preview-image"
            />
          </div>
        )}

        {/* Upload Button */}
        {selectedFile && (
          <button 
            className="upload-btn"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? '⏳ Đang upload...' : '📤 Upload ảnh'}
          </button>
        )}

        {/* Error Display */}
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
      </div>

      {/* Upload Guidelines */}
      <div className="upload-guidelines">
        <h5>Hướng dẫn upload:</h5>
        <ul>
          <li>✅ Định dạng: JPG, PNG, GIF</li>
          <li>✅ Kích thước tối đa: 10MB</li>
          <li>✅ Tỷ lệ khuyến nghị: 4:3 hoặc 16:9</li>
          <li>✅ Độ phân giải tối thiểu: 300x300px</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;





