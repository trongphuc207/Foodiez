import React, { useState } from 'react'
import './ShipperEarningsPage.css'
import SidebarComponent from '../../components/SidebarComponent/SidebarComponent'
import { FiMenu } from 'react-icons/fi'

export default function ShipperEarningsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const earningsData = {
    today: {
      total: 480000,
      deliveries: 24,
      average: 20000,
      bonus: 50000
    },
    week: {
      total: 3200000,
      deliveries: 156,
      average: 20513,
      bonus: 200000
    },
    month: {
      total: 12800000,
      deliveries: 624,
      average: 20513,
      bonus: 800000
    }
  }

  const periods = [
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

  const currentData = earningsData[selectedPeriod]

  const recentTransactions = [
    {
      id: "#001",
      customer: "Nguyễn Văn A",
      amount: 25000,
      status: "completed",
      time: "10:30",
      bonus: 5000
    },
    {
      id: "#002",
      customer: "Trần Thị B",
      amount: 18000,
      status: "completed", 
      time: "09:45",
      bonus: 0
    },
    {
      id: "#003",
      customer: "Lê Văn C",
      amount: 32000,
      status: "completed",
      time: "09:15",
      bonus: 10000
    }
  ]

  return (
    <div className="shipper-earnings-page">
      {/* Header with hamburger menu */}
      <div className="dashboard-header">
        <div className="header-left">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          <div className="header-title">
            <h1>Thu nhập</h1>
            <p>Theo dõi thu nhập và giao dịch của bạn</p>
          </div>
        </div>
      </div>

      <div className="period-selector">
        {periods.map(period => (
          <button
            key={period.id}
            className={`period-btn ${selectedPeriod === period.id ? 'active' : ''}`}
            onClick={() => setSelectedPeriod(period.id)}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div className="earnings-overview">
        <div className="earnings-card primary">
          <div className="card-header">
            <h3>Tổng thu nhập</h3>
            <div className="card-icon">💰</div>
          </div>
          <div className="card-content">
            <div className="main-value">{formatCurrency(currentData.total)}</div>
            <div className="sub-value">{currentData.deliveries} đơn hàng</div>
          </div>
        </div>

        <div className="earnings-card">
          <div className="card-header">
            <h3>Trung bình/đơn</h3>
            <div className="card-icon">📊</div>
          </div>
          <div className="card-content">
            <div className="main-value">{formatCurrency(currentData.average)}</div>
            <div className="sub-value">mỗi giao hàng</div>
          </div>
        </div>

        <div className="earnings-card">
          <div className="card-header">
            <h3>Thưởng</h3>
            <div className="card-icon">🎁</div>
          </div>
          <div className="card-content">
            <div className="main-value">{formatCurrency(currentData.bonus)}</div>
            <div className="sub-value">điểm thưởng</div>
          </div>
        </div>
      </div>

      <div className="earnings-breakdown">
        <div className="breakdown-card">
          <h3>Phân tích thu nhập</h3>
          <div className="breakdown-chart">
            <div className="chart-placeholder">
              <div className="chart-icon">📈</div>
              <p>Biểu đồ thu nhập theo ngày</p>
            </div>
          </div>
        </div>

        <div className="breakdown-card">
          <h3>Mục tiêu</h3>
          <div className="goals-section">
            <div className="goal-item">
              <div className="goal-info">
                <span className="goal-label">Đơn hàng hôm nay</span>
                <span className="goal-progress">{currentData.deliveries}/30</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(currentData.deliveries / 30) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="goal-item">
              <div className="goal-info">
                <span className="goal-label">Thu nhập hôm nay</span>
                <span className="goal-progress">{formatCurrency(currentData.total)}/500,000đ</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(currentData.total / 500000) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-transactions">
        <h3>Giao dịch gần đây</h3>
        <div className="transactions-list">
          {recentTransactions.map(transaction => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-info">
                <div className="transaction-header">
                  <span className="transaction-id">{transaction.id}</span>
                  <span className="transaction-time">{transaction.time}</span>
                </div>
                <div className="transaction-customer">{transaction.customer}</div>
                <div className="transaction-status completed">Hoàn thành</div>
              </div>
              
              <div className="transaction-amount">
                <div className="amount-main">{formatCurrency(transaction.amount)}</div>
                {transaction.bonus > 0 && (
                  <div className="amount-bonus">+{formatCurrency(transaction.bonus)} thưởng</div>
                )}
              </div>
            </div>
          ))}
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
