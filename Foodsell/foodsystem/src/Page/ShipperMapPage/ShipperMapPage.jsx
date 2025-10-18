import React, { useState } from 'react'
import './ShipperMapPage.css'
import SidebarComponent from '../../components/SidebarComponent/SidebarComponent'

export default function ShipperMapPage() {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const deliveryPoints = [
    {
      id: "#001",
      customer: "Nguyễn Văn A",
      address: "123 Đường ABC, Q1, TP.HCM",
      coordinates: { lat: 10.7769, lng: 106.7009 },
      status: "delivering",
      priority: "high",
      estimatedTime: "15 phút"
    },
    {
      id: "#002",
      customer: "Trần Thị B", 
      address: "456 Đường XYZ, Q2, TP.HCM",
      coordinates: { lat: 10.7870, lng: 106.7051 },
      status: "pending",
      priority: "medium",
      estimatedTime: "25 phút"
    },
    {
      id: "#003",
      customer: "Lê Văn C",
      address: "789 Đường DEF, Q3, TP.HCM", 
      coordinates: { lat: 10.7829, lng: 106.6897 },
      status: "pending",
      priority: "low",
      estimatedTime: "35 phút"
    }
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Chờ giao'
      case 'delivering': return 'Đang giao'
      default: return status
    }
  }

  return (
    <div className="shipper-map-page">
      {/* Header with Menu Button */}
      <div className="page-header">
        <div className="header-left">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <i className="bi bi-list"></i>
          </button>
          <div className="header-title">
            <h1 className="page-title">Bản đồ</h1>
            <p className="page-subtitle">Theo dõi tuyến đường và địa điểm giao hàng</p>
          </div>
        </div>
      </div>

      <div className="map-container">
        <div className="map-placeholder">
          <div className="map-icon">🗺️</div>
          <h3>Bản đồ tích hợp</h3>
          <p>Đang tích hợp Google Maps API</p>
          <div className="map-controls">
            <button className="control-btn">📍 Vị trí hiện tại</button>
            <button className="control-btn">🔄 Làm mới</button>
            <button className="control-btn">🎯 Tối ưu tuyến</button>
          </div>
        </div>

        <div className="delivery-points">
          <h3 className="points-title">Điểm giao hàng</h3>
          {deliveryPoints.map(point => (
            <div 
              key={point.id} 
              className={`point-card ${selectedOrder === point.id ? 'selected' : ''}`}
              onClick={() => setSelectedOrder(point.id)}
            >
              <div className="point-header">
                <div className="point-id">{point.id}</div>
                <div 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(point.priority) }}
                >
                  {point.priority}
                </div>
              </div>
              
              <div className="point-content">
                <h4 className="customer-name">{point.customer}</h4>
                <p className="customer-address">📍 {point.address}</p>
                <div className="point-details">
                  <span className={`status-badge ${point.status}`}>
                    {getStatusLabel(point.status)}
                  </span>
                  <span className="time-estimate">⏱️ {point.estimatedTime}</span>
                </div>
              </div>

              <div className="point-actions">
                <button className="action-btn primary">Chỉ đường</button>
                <button className="action-btn secondary">Chi tiết</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="route-summary">
        <div className="summary-card">
          <h3>Tổng quan tuyến đường</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Tổng khoảng cách:</span>
              <span className="stat-value">12.5 km</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Thời gian dự kiến:</span>
              <span className="stat-value">45 phút</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Số điểm giao:</span>
              <span className="stat-value">3 điểm</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Thu nhập dự kiến:</span>
              <span className="stat-value">180,000đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <SidebarComponent
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  )
}
