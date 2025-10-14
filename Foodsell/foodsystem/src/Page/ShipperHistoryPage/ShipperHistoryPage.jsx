import React, { useState } from 'react'
import './ShipperHistoryPage.css'

export default function ShipperHistoryPage() {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState('today')

  const historyData = [
    {
      id: "#001",
      customer: "Nguyễn Văn A",
      address: "123 Đường ABC, Q1, TP.HCM",
      amount: 25000,
      status: "completed",
      date: "2025-01-15",
      time: "10:30",
      rating: 5,
      feedback: "Giao hàng nhanh, thái độ tốt"
    },
    {
      id: "#002",
      customer: "Trần Thị B", 
      address: "456 Đường XYZ, Q2, TP.HCM",
      amount: 18000,
      status: "completed",
      date: "2025-01-15",
      time: "09:45",
      rating: 4,
      feedback: "Tốt"
    },
    {
      id: "#003",
      customer: "Lê Văn C",
      address: "789 Đường DEF, Q3, TP.HCM",
      amount: 32000,
      status: "completed",
      date: "2025-01-14",
      time: "14:20",
      rating: 5,
      feedback: "Rất hài lòng"
    },
    {
      id: "#004",
      customer: "Phạm Thị D",
      address: "321 Đường GHI, Q4, TP.HCM",
      amount: 15000,
      status: "cancelled",
      date: "2025-01-14",
      time: "11:15",
      rating: null,
      feedback: "Khách hủy đơn"
    }
  ]

  const filters = [
    { id: 'all', label: 'Tất cả' },
    { id: 'completed', label: 'Hoàn thành' },
    { id: 'cancelled', label: 'Đã hủy' }
  ]

  const dateFilters = [
    { id: 'today', label: 'Hôm nay' },
    { id: 'week', label: 'Tuần này' },
    { id: 'month', label: 'Tháng này' }
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành'
      case 'cancelled': return 'Đã hủy'
      default: return status
    }
  }

  const getStatusClass = (status) => {
    return `status-badge ${status}`
  }

  const renderStars = (rating) => {
    if (!rating) return null
    return '⭐'.repeat(rating)
  }

  const filteredData = historyData.filter(item => {
    const statusMatch = selectedFilter === 'all' || item.status === selectedFilter
    // Có thể thêm logic filter theo date ở đây
    return statusMatch
  })

  const stats = {
    total: historyData.length,
    completed: historyData.filter(item => item.status === 'completed').length,
    cancelled: historyData.filter(item => item.status === 'cancelled').length,
    averageRating: (historyData.filter(item => item.rating).reduce((sum, item) => sum + item.rating, 0) / historyData.filter(item => item.rating).length).toFixed(1)
  }

  return (
    <div className="shipper-history-page">
      <div className="page-header">
        <h1 className="page-title">Lịch sử</h1>
        <p className="page-subtitle">Xem lại các đơn hàng đã giao</p>
      </div>

      <div className="history-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Tổng đơn hàng</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Hoàn thành</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.cancelled}</div>
          <div className="stat-label">Đã hủy</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.averageRating}⭐</div>
          <div className="stat-label">Đánh giá TB</div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Trạng thái:</label>
          <div className="filter-buttons">
            {filters.map(filter => (
              <button
                key={filter.id}
                className={`filter-btn ${selectedFilter === filter.id ? 'active' : ''}`}
                onClick={() => setSelectedFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Thời gian:</label>
          <div className="filter-buttons">
            {dateFilters.map(filter => (
              <button
                key={filter.id}
                className={`filter-btn ${selectedDate === filter.id ? 'active' : ''}`}
                onClick={() => setSelectedDate(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="history-list">
        {filteredData.map(item => (
          <div key={item.id} className="history-item">
            <div className="item-header">
              <div className="item-id">{item.id}</div>
              <div className={getStatusClass(item.status)}>
                {getStatusLabel(item.status)}
              </div>
            </div>

            <div className="item-content">
              <div className="customer-info">
                <h3 className="customer-name">{item.customer}</h3>
                <p className="customer-address">📍 {item.address}</p>
              </div>

              <div className="item-details">
                <div className="detail-row">
                  <span className="detail-label">💰 Số tiền:</span>
                  <span className="detail-value">{formatCurrency(item.amount)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📅 Ngày:</span>
                  <span className="detail-value">{formatDate(item.date)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🕐 Giờ:</span>
                  <span className="detail-value">{item.time}</span>
                </div>
                {item.rating && (
                  <div className="detail-row">
                    <span className="detail-label">⭐ Đánh giá:</span>
                    <span className="detail-value">{renderStars(item.rating)}</span>
                  </div>
                )}
              </div>

              {item.feedback && (
                <div className="feedback-section">
                  <span className="feedback-label">💬 Phản hồi:</span>
                  <p className="feedback-text">{item.feedback}</p>
                </div>
              )}
            </div>

            <div className="item-actions">
              <button className="action-btn secondary">Xem chi tiết</button>
              {item.status === 'completed' && (
                <button className="action-btn primary">Đánh giá lại</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>Không có dữ liệu</h3>
          <p>Chưa có đơn hàng nào trong bộ lọc này</p>
        </div>
      )}
    </div>
  )
}
