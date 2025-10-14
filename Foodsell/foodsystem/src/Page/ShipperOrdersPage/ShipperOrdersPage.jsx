import React, { useState } from 'react'
import './ShipperOrdersPage.css'

export default function ShipperOrdersPage() {
  const [activeTab, setActiveTab] = useState('all')

  const orders = [
    {
      id: "#001",
      customer: "Nguyễn Văn A",
      address: "123 Đường ABC, Q1, TP.HCM",
      amount: "250,000đ",
      status: "delivering",
      time: "10:30",
      phone: "0123456789"
    },
    {
      id: "#002", 
      customer: "Trần Thị B",
      address: "456 Đường XYZ, Q2, TP.HCM",
      amount: "180,000đ",
      status: "completed",
      time: "09:45",
      phone: "0987654321"
    },
    {
      id: "#003",
      customer: "Lê Văn C", 
      address: "789 Đường DEF, Q3, TP.HCM",
      amount: "320,000đ",
      status: "pending",
      time: "09:15",
      phone: "0369852147"
    },
    {
      id: "#004",
      customer: "Phạm Thị D",
      address: "321 Đường GHI, Q4, TP.HCM", 
      amount: "150,000đ",
      status: "delivering",
      time: "08:30",
      phone: "0741258963"
    }
  ]

  const tabs = [
    { id: 'all', label: 'Tất cả', count: orders.length },
    { id: 'pending', label: 'Chờ nhận', count: orders.filter(o => o.status === 'pending').length },
    { id: 'delivering', label: 'Đang giao', count: orders.filter(o => o.status === 'delivering').length },
    { id: 'completed', label: 'Hoàn thành', count: orders.filter(o => o.status === 'completed').length }
  ]

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab)

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Chờ nhận'
      case 'delivering': return 'Đang giao'
      case 'completed': return 'Hoàn thành'
      default: return status
    }
  }

  const getStatusClass = (status) => {
    return `order-status ${status}`
  }

  return (
    <div className="shipper-orders-page">
      <div className="page-header">
        <h1 className="page-title">Đơn hàng</h1>
        <p className="page-subtitle">Quản lý đơn hàng giao của bạn</p>
      </div>

      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="orders-container">
        {filteredOrders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-id">{order.id}</div>
              <div className={getStatusClass(order.status)}>
                {getStatusLabel(order.status)}
              </div>
            </div>
            
            <div className="order-content">
              <div className="customer-info">
                <h3 className="customer-name">{order.customer}</h3>
                <p className="customer-phone">📞 {order.phone}</p>
              </div>
              
              <div className="order-details">
                <div className="detail-item">
                  <span className="detail-label">📍 Địa chỉ:</span>
                  <span className="detail-value">{order.address}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">💰 Số tiền:</span>
                  <span className="detail-value">{order.amount}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">🕐 Thời gian:</span>
                  <span className="detail-value">{order.time}</span>
                </div>
              </div>
            </div>

            <div className="order-actions">
              {order.status === 'pending' && (
                <button className="action-btn primary">Nhận đơn</button>
              )}
              {order.status === 'delivering' && (
                <div className="action-group">
                  <button className="action-btn secondary">Cập nhật</button>
                  <button className="action-btn success">Hoàn thành</button>
                </div>
              )}
              {order.status === 'completed' && (
                <button className="action-btn secondary">Xem chi tiết</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>Không có đơn hàng</h3>
          <p>Chưa có đơn hàng nào trong danh mục này</p>
        </div>
      )}
    </div>
  )
}
