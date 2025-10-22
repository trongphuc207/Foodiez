import React from 'react'
import './AddressDetailModal.css'
import { 
  FiMapPin, 
  FiHome, 
  FiX, 
  FiClock, 
  FiPhone, 
  FiTruck, 
  FiCopy, 
  FiNavigation,
  FiMap
} from 'react-icons/fi'

export default function AddressDetailModal({ address, onClose }) {
  if (!address) return null

  const { address: addressText, type } = address

  const handleGetDirections = () => {
    // Mở ứng dụng bản đồ với địa chỉ
    const encodedAddress = encodeURIComponent(addressText)
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
    window.open(mapUrl, '_blank')
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(addressText)
    // Có thể thêm toast notification ở đây
    alert('Đã sao chép địa chỉ!')
  }

  const handleCallCustomer = () => {
    // Logic để gọi khách hàng
    console.log('Calling customer...')
  }

  return (
    <div className="address-modal-overlay" onClick={onClose}>
      <div className="address-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <div className={`title-icon ${type}`}>
              {type === 'pickup' ? <FiMapPin /> : <FiHome />}
            </div>
            <div className="title-text">
              <h3>{type === 'pickup' ? 'Địa chỉ lấy hàng' : 'Địa chỉ giao hàng'}</h3>
              <p>Chi tiết địa chỉ và hướng dẫn</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {/* Address Display */}
          <div className="address-display">
            <div className="address-icon-large">
              {type === 'pickup' ? <FiMapPin /> : <FiHome />}
            </div>
            <div className="address-text-large">
              <div className="address-label">
                {type === 'pickup' ? 'Địa chỉ lấy hàng:' : 'Địa chỉ giao hàng:'}
              </div>
              <div className="address-value">{addressText}</div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="address-info">
            <div className="info-item">
              <div className="info-icon">
                <FiClock />
              </div>
              <div className="info-content">
                <div className="info-label">Thời gian hoạt động</div>
                <div className="info-value">24/7</div>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">
                <FiPhone />
              </div>
              <div className="info-content">
                <div className="info-label">Liên hệ</div>
                <div className="info-value">0901234567</div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <FiTruck />
              </div>
              <div className="info-content">
                <div className="info-label">Phương tiện</div>
                <div className="info-value">Xe máy</div>
              </div>
            </div>
          </div>

          {/* Map Preview */}
          <div className="map-preview">
            <div className="map-placeholder">
              <div className="map-icon">
                <FiMap />
              </div>
              <div className="map-text">Bản đồ sẽ hiển thị ở đây</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="instructions">
            <h4>Hướng dẫn:</h4>
            <ul>
              {type === 'pickup' ? (
                <>
                  <li>Đến địa chỉ lấy hàng đúng giờ hẹn</li>
                  <li>Liên hệ với người bán trước khi đến</li>
                  <li>Kiểm tra hàng hóa trước khi nhận</li>
                  <li>Xác nhận đơn hàng với người bán</li>
                </>
              ) : (
                <>
                  <li>Gọi điện cho khách hàng trước khi giao</li>
                  <li>Đến đúng địa chỉ giao hàng</li>
                  <li>Giao hàng tận tay khách hàng</li>
                  <li>Xác nhận hoàn thành đơn hàng</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          <button className="action-btn secondary" onClick={handleCopyAddress}>
            <span className="btn-icon"><FiCopy /></span>
            Sao chép địa chỉ
          </button>
          <button className="action-btn primary" onClick={handleGetDirections}>
            <span className="btn-icon"><FiNavigation /></span>
            Chỉ đường
          </button>
          <button className="action-btn call" onClick={handleCallCustomer}>
            <span className="btn-icon"><FiPhone /></span>
            Gọi khách hàng
          </button>
        </div>
      </div>
    </div>
  )
}
