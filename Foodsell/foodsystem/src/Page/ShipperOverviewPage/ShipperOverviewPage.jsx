import React, { useState } from 'react'
import './ShipperOverviewPage.css'
import SidebarComponent from '../../components/SidebarComponent/SidebarComponent'
import { FiMenu } from 'react-icons/fi'

export default function ShipperOverviewPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const stats = [
    {
      title: "Đơn hàng hôm nay",
      value: "24",
      change: "+12%",
      changeType: "up",
      icon: "📦",
      description: "so với hôm qua"
    },
    {
      title: "Thu nhập hôm nay", 
      value: "1.2M đ",
      change: "+8%",
      changeType: "up",
      icon: "💰",
      description: "so với hôm qua"
    },
    {
      title: "Đang giao",
      value: "3", 
      change: "-2",
      changeType: "down",
      icon: "🚴",
      description: "so với hôm qua"
    },
    {
      title: "Hoàn thành",
      value: "21",
      change: "+15%", 
      changeType: "up",
      icon: "✅",
      description: "so với hôm qua"
    }
  ]

  return (
    <div className="shipper-overview-page">
      {/* Header with hamburger menu */}
      <div className="dashboard-header">
        <div className="header-left">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          <div className="header-title">
            <h1>Cài đặt</h1>
            <p>Quản lý và theo dõi đơn hàng giao của bạn</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn secondary">Lịch sử</button>
          <button className="action-btn primary">Nhận đơn mới</button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <h3 className="stat-title">{stat.title}</h3>
              <div className="stat-icon">{stat.icon}</div>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-change ${stat.changeType}`}>
                {stat.changeType === 'up' ? '↑' : '↓'} {stat.change} {stat.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overview-sections">
        <div className="section-card">
          <h3 className="section-title">Đơn hàng gần đây</h3>
          <div className="recent-orders">
            <div className="order-item">
              <div className="order-info">
                <span className="order-id">#001</span>
                <span className="order-customer">Nguyễn Văn A</span>
              </div>
              <div className="order-status delivering">Đang giao</div>
            </div>
            <div className="order-item">
              <div className="order-info">
                <span className="order-id">#002</span>
                <span className="order-customer">Trần Thị B</span>
              </div>
              <div className="order-status completed">Hoàn thành</div>
            </div>
            <div className="order-item">
              <div className="order-info">
                <span className="order-id">#003</span>
                <span className="order-customer">Lê Văn C</span>
              </div>
              <div className="order-status pending">Chờ nhận</div>
            </div>
          </div>
        </div>

        <div className="section-card">
          <h3 className="section-title">Thống kê tuần</h3>
          <div className="weekly-stats">
            <div className="stat-row">
              <span className="stat-label">Tổng đơn hàng:</span>
              <span className="stat-value">156</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Tổng thu nhập:</span>
              <span className="stat-value">7.8M đ</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Tỷ lệ thành công:</span>
              <span className="stat-value">98%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Đánh giá TB:</span>
              <span className="stat-value">4.9 ⭐</span>
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
