import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom' // Commented out - not used yet
import './ShipperDashboard.css'
import AddressDetailModal from './AddressDetailModal'
import SidebarComponent from '../SidebarComponent/SidebarComponent'
import { shipperAPI } from '../../api/shipper'
import { 
  FiPackage, 
  FiCheck, 
  FiTruck, 
  FiDollarSign,
  FiMenu,
  FiUser,
  FiMapPin,
  FiPhone
} from 'react-icons/fi'

export default function ShipperDashboard() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [orders, setOrders] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load data from API
  useEffect(() => {
    loadShipperData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadShipperData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load orders and dashboard data in parallel
      const [ordersResponse, dashboardResponse] = await Promise.all([
        shipperAPI.getOrders(),
        shipperAPI.getDashboard()
      ])
      
      setOrders(ordersResponse || [])
      setDashboardData(dashboardResponse)
      
      // Debug log
      console.log('Shipper data loaded:', { ordersResponse, dashboardResponse })
    } catch (err) {
      console.error('Error loading shipper data:', err)
      setError(err.message)
      // Fallback to mock data if API fails
      setOrders(getMockOrders())
      setDashboardData(getMockDashboardData())
    } finally {
      setLoading(false)
    }
  }

  // Mock data fallback
  const getMockOrders = () => [
    {
      id: "DH001",
      customer: "Nguyễn Văn A",
      phone: "0901234567",
      status: "waiting_pickup",
      time: "10:30",
      pickupAddress: "123 Nguyễn Huệ, Q.1, TP.HCM",
      deliveryAddress: "456 Lê Lợi, Q.3, TP.HCM",
      items: 2,
      distance: "3.5 km",
      price: "25.000₫"
    },
    {
      id: "DH002",
      customer: "Trần Thị B", 
      phone: "0912345678",
      status: "picked_up",
      time: "11:00",
      pickupAddress: "789 Trần Hưng Đạo, Q.5, TP.HCM",
      deliveryAddress: "321 Võ Văn Tân, Q.3, TP.HCM",
      items: 1,
      distance: "2.8 km",
      price: "20.000₫",
      note: "Gọi trước khi đến"
    },
    {
      id: "DH003",
      customer: "Lê Văn C",
      phone: "0923456789", 
      status: "delivering",
      time: "11:30",
      pickupAddress: "555 Hai Bà Trưng, Q.1, TP.HCM",
      deliveryAddress: "888 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM",
      items: 3,
      distance: "5.2 km",
      price: "35.000₫"
    },
    {
      id: "DH004",
      customer: "Phạm Thị D",
      phone: "0934567890",
      status: "delivered", 
      time: "09:45",
      pickupAddress: "222 Pasteur, Q.1, TP.HCM",
      deliveryAddress: "111 Cách Mạng Tháng 8, Q.10, TP.HCM",
      items: 1,
      distance: "4.1 km",
      price: "30.000₫"
    }
  ]

  const getMockDashboardData = () => ({
    totalOrders: 4,
    deliveredOrders: 1,
    deliveringOrders: 2,
    totalEarnings: "30.000₫"
  })

  // Handle order actions
  const handleAcceptOrder = async (orderId) => {
    try {
      console.log('Accepting order:', orderId)
      await shipperAPI.acceptOrder(orderId)
      // Reload data after accepting order
      loadShipperData()
    } catch (err) {
      console.error('Error accepting order:', err)
      alert('Không thể nhận đơn hàng: ' + err.message)
    }
  }

  const handleUpdateStatus = async (orderId, status) => {
    try {
      console.log('Updating order status:', orderId, status)
      await shipperAPI.updateDeliveryStatus(orderId, status)
      // Reload data after updating status
      loadShipperData()
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Không thể cập nhật trạng thái: ' + err.message)
    }
  }

  const tabs = [
    { id: 'all', label: 'Tất cả', count: orders.length },
    { id: 'waiting_pickup', label: 'Chờ lấy', count: orders.filter(o => o.status === 'waiting_pickup').length },
    { id: 'picked_up', label: 'Đã lấy', count: orders.filter(o => o.status === 'picked_up').length },
    { id: 'delivering', label: 'Đang giao', count: orders.filter(o => o.status === 'delivering').length },
    { id: 'delivered', label: 'Đã giao', count: orders.filter(o => o.status === 'delivered').length }
  ]

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab)

  const getStatusLabel = (status) => {
    switch (status) {
      case 'waiting_pickup': return 'Chờ lấy hàng'
      case 'picked_up': return 'Đã lấy hàng'
      case 'delivering': return 'Đang giao'
      case 'delivered': return 'Đã giao'
      default: return status
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'waiting_pickup': return 'status-waiting'
      case 'picked_up': return 'status-picked'
      case 'delivering': return 'status-delivering'
      case 'delivered': return 'status-delivered'
      default: return 'status-default'
    }
  }

  const handleAddressClick = (address, type) => {
    setSelectedAddress({ address, type })
    setShowAddressModal(true)
  }

  const closeAddressModal = () => {
    setShowAddressModal(false)
    setSelectedAddress(null)
  }

  if (loading) {
    return (
      <div className="shipper-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="shipper-dashboard">
        <div className="error-container">
          <h3>Lỗi tải dữ liệu</h3>
          <p>{error}</p>
          <button onClick={loadShipperData} className="retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="shipper-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          <div className="header-title">
            <h1>Shipper Dashboard</h1>
            <p>Xin chào, Nguyễn Văn Shipper</p>
          </div>
        </div>
        <div className="header-right">
          <div className="profile-avatar">
            <FiUser />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">
            <FiPackage />
          </div>
          <div className="card-content">
            <div className="card-number">
              {loading ? '...' : (dashboardData?.totalOrders || orders.length)}
            </div>
            <div className="card-label">Tổng đơn</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon delivered">
            <FiCheck />
          </div>
          <div className="card-content">
            <div className="card-number">
              {loading ? '...' : orders.filter(o => o.status === 'delivered').length}
            </div>
            <div className="card-label">Đã giao</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon delivering">
            <FiTruck />
          </div>
          <div className="card-content">
            <div className="card-number">
              {loading ? '...' : orders.filter(o => o.status === 'delivering').length}
            </div>
            <div className="card-label">Đang giao</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon income">
            <FiDollarSign />
          </div>
          <div className="card-content">
            <div className="card-number">
              {loading ? '...' : (dashboardData?.totalEarnings || '0₫')}
            </div>
            <div className="card-label">Thu nhập</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="orders-container">
        {filteredOrders.map(order => (
          <div key={order.id} className="order-card">
            {/* Order Header */}
            <div className="order-header">
              <div className="order-info">
                <div className="order-icon">
                  <FiPackage />
                </div>
                <div className="order-details">
                  <div className="order-id">#{order.id}</div>
                  <div className="order-time">{order.time}</div>
                </div>
              </div>
              <div className={`order-status ${getStatusClass(order.status)}`}>
                {getStatusLabel(order.status)}
              </div>
            </div>

            {/* Customer Info */}
            <div className="customer-info">
              <div className="customer-avatar">
                {order.customer && order.customer.length > 0 
                  ? order.customer.charAt(order.customer.lastIndexOf(' ') + 1)
                  : '?'
                }
              </div>
              <div className="customer-details">
                <div className="customer-name">{order.customer}</div>
                <div className="customer-phone">
                  <FiPhone /> {order.phone}
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="addresses-section">
              {/* Pickup Address */}
              <div className="address-item">
                <div className="address-icon pickup">
                  <FiMapPin />
                </div>
                <div className="address-content">
                  <div className="address-label">Lấy hàng</div>
                  <div 
                    className="address-text clickable"
                    onClick={() => handleAddressClick(order.pickupAddress, 'pickup')}
                  >
                    {order.pickupAddress}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="address-item">
                <div className="address-icon delivery">
                  <FiMapPin />
                </div>
                <div className="address-content">
                  <div className="address-label">Giao hàng</div>
                  <div 
                    className="address-text clickable"
                    onClick={() => handleAddressClick(order.deliveryAddress, 'delivery')}
                  >
                    {order.deliveryAddress}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <div className="summary-left">
                <span>{order.items} món ăn</span>
                <span className="separator">•</span>
                <span>{order.distance}</span>
              </div>
              <div className="summary-right">
                <span className="price">↗ {order.price}</span>
              </div>
            </div>

            {/* Notes */}
            {order.note && (
              <div className="order-note">
                <div className="note-content">
                  Ghi chú: {order.note}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="order-actions">
              {order.status === 'waiting_pickup' && (
                <button 
                  className="action-btn primary"
                  onClick={() => handleAcceptOrder(order.id)}
                  disabled={loading}
                >
                  <span className="btn-icon"><FiPackage /></span>
                  Nhận đơn
                  <span className="btn-icon"><FiTruck /></span>
                </button>
              )}
              {order.status === 'picked_up' && (
                <div className="action-group">
                  <button 
                    className="action-btn primary"
                    onClick={() => handleUpdateStatus(order.id, 'delivering')}
                    disabled={loading}
                  >
                    <span className="btn-icon"><FiTruck /></span>
                    Bắt đầu giao
                  </button>
                  <button className="action-btn secondary">
                    <span className="btn-icon"><FiPhone /></span>
                  </button>
                </div>
              )}
              {order.status === 'delivering' && (
                <div className="action-group">
                  <button 
                    className="action-btn success"
                    onClick={() => handleUpdateStatus(order.id, 'delivered')}
                    disabled={loading}
                  >
                    <span className="btn-icon"><FiCheck /></span>
                    Hoàn thành
                  </button>
                  <button className="action-btn secondary">
                    <span className="btn-icon"><FiPhone /></span>
                  </button>
                </div>
              )}
              {order.status === 'delivered' && (
                <div className="completed-status">
                  <span className="completed-icon"><FiCheck /></span>
                  <span className="completed-text">Đã hoàn thành</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Address Detail Modal */}
      {showAddressModal && (
        <AddressDetailModal
          address={selectedAddress}
          onClose={closeAddressModal}
        />
      )}

      {/* Sidebar */}
      <SidebarComponent
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </div>
  )
}
