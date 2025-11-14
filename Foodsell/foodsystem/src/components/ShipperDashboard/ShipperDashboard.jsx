import React, { useState, useEffect, useCallback } from 'react'
// import { useNavigate } from 'react-router-dom' // Commented out - not used yet
import './ShipperDashboard.css'
import { useAuth } from '../../hooks/useAuth'
import AddressDetailModal from './AddressDetailModal'
import SidebarComponent from '../SidebarComponent/SidebarComponent'
import { shipperAPI } from '../../api/shipper'
import { FiPackage, FiCheck, FiTruck, FiDollarSign,FiMenu,FiUser,FiMapPin,FiPhone} from 'react-icons/fi'
// Fallback shipping distance/fee helpers (used when backend distance is 0 or missing)
import { calculateShippingFee, DISTRICT_DISTANCES, inferDistrictFromAddress } from '../../config/shippingConfig'

export default function ShipperDashboard() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [orders, setOrders] = useState([])
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  // Xử lý nhận đơn hàng
  const handleAcceptOrder = async (orderId) => {
    try {
      setLoading(true)
      const response = await shipperAPI.acceptOrder(orderId, null) // Pass null for note if not needed
      if (response && response.success) {
        // Reload data after accepting
        await loadShipperData()
        alert(response.message || 'Đã nhận đơn hàng thành công!')
      } else {
        throw new Error(response.message || 'Không thể nhận đơn hàng')
      }
    } catch (err) {
      console.error('Error accepting order:', err)
      alert('Không thể nhận đơn hàng: ' + (err.message || 'Đã có lỗi xảy ra'))
    } finally {
      setLoading(false)
    }
  }

  // Load data from API
  const loadShipperData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load orders based on active tab and dashboard data in parallel
      const [ordersResponse, dashboardResponse] = await Promise.all([
        // Use the dedicated "available" endpoint for the default "all" tab so
        // the dashboard shows available/accepted orders rather than all assigned orders.
        shipperAPI.getOrders(activeTab !== 'all' ? activeTab : 'available'),
        shipperAPI.getDashboard()
      ])

      // Debugging: log raw responses so we can inspect the API shape in the browser console
      console.debug('shipperAPI.getOrders response:', ordersResponse)
      console.debug('shipperAPI.getDashboard response:', dashboardResponse)

      if (ordersResponse && ordersResponse.success) {
        setOrders(ordersResponse.data || [])
      } else {
        // Support alternative response shapes: if backend returns an array directly or {data: [...]}
        if (Array.isArray(ordersResponse)) {
          setOrders(ordersResponse)
        } else if (ordersResponse && ordersResponse.data && Array.isArray(ordersResponse.data)) {
          setOrders(ordersResponse.data)
        } else {
          setError((ordersResponse && ordersResponse.message) || 'Không thể tải danh sách đơn hàng')
        }
      }

      if (dashboardResponse && dashboardResponse.success) {
        setDashboardData(dashboardResponse.data)
      } else {
        // also support when dashboardResponse is the raw dashboard object or {data: {...}}
        if (dashboardResponse && dashboardResponse.data) {
          setDashboardData(dashboardResponse.data)
        } else if (dashboardResponse && !dashboardResponse.success) {
          console.error('Error loading dashboard:', dashboardResponse.message)
        } else {
          setDashboardData(dashboardResponse)
        }
      }
    } catch (err) {
      console.error('Error loading shipper data:', err)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadShipperData()
  }, [loadShipperData]) // Reload when loadShipperData changes

  // Render loading state
  if (loading) {
    return (
      <div className="shipper-dashboard loading">
        <div className="loading-spinner">
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="shipper-dashboard error">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadShipperData}>Thử lại</button>
        </div>
      </div>
    )
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

  // Orders matching the active tab (based on order.status)
  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status === activeTab)

  // Bring orders that have an assignment status of 'accepted' to the top
  // Support both camelCase and snake_case property names from backend
  const acceptedOrders = orders.filter(o => (o.assignmentStatus === 'accepted' || o.assignment_status === 'accepted'))

  // Build the final list to display: accepted orders first, then the rest (deduplicated)
  const displayOrders = [
    ...acceptedOrders,
    ...filteredOrders.filter(o => !(o.assignmentStatus === 'accepted' || o.assignment_status === 'accepted'))
  ]

  // Use central helper to infer district from address (district name or street -> district mapping)
  const extractDistrictFromAddress = (address) => inferDistrictFromAddress(address)

  // Returns distance like Checkout: always estimate via districts using calculateShippingFee
  const getDisplayDistance = (order) => {
    try {
      // Estimate from districts derived from addresses (align with Checkout logic)
      const shopDistrict = extractDistrictFromAddress(order.pickupAddress || order.pickup_address || '')
      const orderDistrict = extractDistrictFromAddress(order.deliveryAddress || order.delivery_address || order.addressText || '')
      if (shopDistrict && orderDistrict) {
        const details = calculateShippingFee(shopDistrict, orderDistrict)
        if (details && typeof details.distance === 'number') {
          return `${details.distance.toFixed(1)} km`
        }
      }

      return '—'
    } catch (err) {
      console.error('getDisplayDistance error', err)
      return '—'
    }
  }

  // Compute shipping fee exactly like Checkout (ignore backend persisted/price text)
  const getDisplayPrice = (order) => {
    try {
      // Estimate from districts like Checkout
      const shopDistrict = extractDistrictFromAddress(order.pickupAddress || order.pickup_address || '')
      const orderDistrict = extractDistrictFromAddress(order.deliveryAddress || order.delivery_address || order.addressText || '')
      if (shopDistrict && orderDistrict) {
        const details = calculateShippingFee(shopDistrict, orderDistrict)
        return (details?.fee ?? 0).toLocaleString('vi-VN') + 'đ'
      }
      return '0đ'
    } catch (err) {
      console.error('getDisplayPrice error', err)
      return '0đ'
    }
  }

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



  return (
    <div className="shipper-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          <span className="page-title">Shipper Dashboard</span>
        </div>
        <div className="header-right">
          <span className="user-name-display">{user?.fullName || user?.full_name || user?.name || 'Chưa đăng nhập'}</span>
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
              {loading ? '...' : dashboardData?.totalOrders}
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
              {loading ? '...' : dashboardData?.deliveredOrders}
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
              {loading ? '...' : dashboardData?.deliveringOrders}
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
              {loading ? '...' : dashboardData?.totalEarnings}
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
  {displayOrders.map(order => (
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
                <span>{getDisplayDistance(order)}</span>
              </div>
              <div className="summary-right">
                <span className="price">↗ {getDisplayPrice(order)}</span>
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
              {(order.assignmentStatus === 'accepted' && !order.assignedShipperId) && (
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
