import React, { useState } from 'react'
import './ShipperOrdersPage.css'
import SidebarComponent from '../../components/SidebarComponent/SidebarComponent'
import { FiMenu } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { shipperAPI } from '../../api/shipper'

export default function ShipperOrdersPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  // Fetch shipper orders from backend (uses auth token from localStorage)
  const { data: ordersResp, isLoading, error, refetch } = useQuery({
    queryKey: ['shipperOrders', activeTab],
    // Use the backend "available" endpoint when viewing the "all" tab so
    // the shipper dashboard only shows orders that are available/accepted for pickup.
    queryFn: () => shipperAPI.getOrders(activeTab === 'all' ? 'available' : activeTab),
    refetchOnWindowFocus: false,
  })

  // Lọc ra chỉ những đơn hàng có assignment_status = 'accepted'
  const orders = (ordersResp?.data || []).filter(order => 
    order.assignment_status === 'accepted'
  )

  // Các đơn đang giao và đã hoàn thành sẽ được lọc theo status
  const deliveringOrders = orders.filter(o => o.status === 'delivering')
  const completedOrders = orders.filter(o => o.status === 'completed')
  
  const tabs = [
    { id: 'all', label: 'Tất cả', count: orders.length },
    { id: 'available', label: 'Chờ nhận', count: orders.length },
    { id: 'delivering', label: 'Đang giao', count: deliveringOrders.length },
    { id: 'completed', label: 'Hoàn thành', count: completedOrders.length }
  ]

  const filteredOrders = activeTab === 'all' || activeTab === 'available'
    ? orders
    : orders.filter(order => order.status === activeTab)

  const [accepting, setAccepting] = React.useState(null);

  const handleAcceptOrder = async (orderId) => {
    try {
      setAccepting(orderId);
      await shipperAPI.acceptOrder(orderId);
      // refresh list
      if (refetch) await refetch();
    } catch (err) {
      console.error('Failed to accept order', err);
      alert('Không thể nhận đơn: ' + (err?.message || 'Lỗi'));
    } finally {
      setAccepting(null);
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'delivering': return 'Đang giao'
      case 'completed': return 'Đã hoàn thành'
      default: return 'Chờ nhận'  // Mặc định là "Chờ nhận" vì đã lọc assignment_status = 'accepted'
    }
  }

  const getStatusClass = (status) => {
    return `order-status ${status}`
  }

  if (isLoading) return (
    <div className="shipper-orders-page">
      <div className="dashboard-header">
        <div className="header-left">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          <span className="page-title">Đơn hàng</span>
        </div>
        <div className="header-right">
          <span className="user-name-display">{user?.fullName || user?.full_name || user?.name || '...'}</span>
        </div>
      </div>
    </div>
  )

  if (error) return (
    <div className="shipper-orders-page">
      <div className="dashboard-header">
        <div className="header-left">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          <span className="page-title">Đơn hàng</span>
        </div>
        <div className="header-right">
          <span className="user-name-display">{user?.fullName || user?.full_name || user?.name || 'Lỗi tải'}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="shipper-orders-page">
      {/* Header with hamburger menu */}
      <div className="dashboard-header">
        <div className="header-left">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          <span className="page-title">Đơn hàng</span>
        </div>
        <div className="header-right">
          <span className="user-name-display">{user?.fullName || user?.full_name || user?.name || 'Chưa đăng nhập'}</span>
        </div>
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
              {/* Show receive button for all orders that passed assignment_status === 'accepted' filter */}
              {!order.isCancelled && (
                <button className="action-btn primary" onClick={() => { if (window.confirm(`Xác nhận nhận đơn #${order.id}?`)) handleAcceptOrder(order.id); }} disabled={accepting === order.id}>
                  {accepting === order.id ? 'Đang xử lý...' : 'Nhận đơn'}
                </button>
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

      {/* Sidebar */}
      <SidebarComponent
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  )
}
