import React, { useEffect } from 'react';
import './ImageModal.css';

const ImageModal = ({ imageUrl, onClose }) => {
  useEffect(() => {
    // Đóng modal khi nhấn ESC
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    // Ngăn scroll body khi modal mở
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!imageUrl) return null;

  const handleOverlayClick = (e) => {
    // Chỉ đóng khi click vào overlay, không đóng khi click vào ảnh
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="image-modal-overlay" onClick={handleOverlayClick}>
      <div className="image-modal-content">
        <button className="image-modal-close" onClick={onClose} aria-label="Đóng">
          ×
        </button>
        <img 
          src={imageUrl} 
          alt="Ảnh đánh giá" 
          className="image-modal-image"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default ImageModal;

