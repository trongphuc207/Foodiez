import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import './OrderDetailPage.css';

function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState(null);

  React.useEffect(() => {
    const loadOrderDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Bạn cần đăng nhập để xem chi tiết đơn hàng');
        }

        // Gọi API lấy chi tiết đơn hàng
        // Use customer endpoint to ensure authenticated customer can fetch their order
        const response = await fetch(`http://localhost:8080/api/customer/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Không thể tải thông tin đơn hàng');
        }

  const data = await response.json();
  console.log('[OrderDetail] raw data:', data);
  setOrder(data);
      } catch (error) {
        console.error('Error loading order detail:', error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetail();
  }, [orderId]);

  // Load last checkout session (nếu có) để hiển thị COD/ship khi đơn bị tách
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('lastCheckoutSession');
      if (raw) {
        setSession(JSON.parse(raw));
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  // Helper to format datetime safely
  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d) ? '—' : d.toLocaleString('vi-VN');
  };

  // Human-friendly payment method label
  const mapPaymentMethod = (raw) => {
    if (!raw) return '—';
    const v = String(raw).toLowerCase();
    if (v.includes('cod')) return 'Thanh toán khi nhận hàng (COD)';
    if (v.includes('momo')) return 'Ví MoMo';
    if (v.includes('bank') || v.includes('transfer')) return 'Chuyển khoản ngân hàng';
    if (v.includes('pay') || v.includes('online') || v.includes('card')) return 'Thanh toán trực tuyến';
    return raw;
  };

  // Helper: safe number parsing for number | string | null (e.g., "19203.0000")
  const asNumber = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return isFinite(val) ? val : 0;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[\s,đ₫]/g, '');
      const n = Number(cleaned);
      return isNaN(n) ? 0 : n;
    }
    return 0;
  };

  const formatVND = (val) => asNumber(val).toLocaleString('vi-VN') + 'đ';

  const [showProducts, setShowProducts] = React.useState(true);

  const handleShopHeaderClick = () => {
    // Toggle product list visibility and scroll into view
    setShowProducts(prev => !prev);
    const el = document.querySelector('.product-list');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCancel = async () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:8080/api/customer/orders/${orderId}/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason: 'Khách hàng hủy đơn hàng' })
        });

        if (!response.ok) {
          throw new Error('Không thể hủy đơn hàng');
        }

        alert('Đã hủy đơn hàng thành công');
        navigate('/orders');
      } catch (error) {
        console.error('Error cancelling order:', error);
        alert(error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="error-screen">
        <h2>Không tìm thấy đơn hàng</h2>
        <button onClick={() => navigate('/orders')}>Quay lại</button>
      </div>
    );
  }

  // prefer payment label from order first, then fallback to loaded checkout session
  // also fallback to pendingOrder (saved during checkout) if present
  let pendingPayment = null;
  try {
    const rawPending = localStorage.getItem('pendingOrder');
    if (rawPending) {
      const parsed = JSON.parse(rawPending);
      if (parsed && parsed.paymentInfo) {
        pendingPayment = parsed.paymentInfo;
      }
    }
  } catch (e) {
    // ignore parse errors
  }

  // Prefer an explicit "Payment Method: <value>" token in notes (backend often stores it there),
  // then fall back to known fields or session/pending data.
  const extractPaymentFromNotes = (notes) => {
    if (!notes) return null;
    try {
      const m = /Payment Method:\s*([^|\n\r]+)/i.exec(String(notes));
      if (m && m[1]) return m[1].trim();
    } catch (e) {
      // ignore
    }
    return null;
  };

  const paymentFromNotes = extractPaymentFromNotes(order.notes || order.note || '');

  const paymentLabel = mapPaymentMethod(
    // explicit token from notes has highest fidelity
    paymentFromNotes ||
    // then prefer any explicit field on the order
    order.paymentMethod || order.payment_method || order.paymentType || order.payment_type || order.method || order.notes ||
    // then session/pending fallbacks
    (session && (session.paymentMethod || session.payment_method || session.method || session.paymentGateway)) ||
    (pendingPayment && (pendingPayment.methodName || pendingPayment.method))
  );

  // detect if this order is the COD collector according to the session
  const isCollectorOrder = Boolean(session && session.codCollectOrderId && String(session.codCollectOrderId) === String(order.id));
  const collectorTotal = session && session.grandTotal ? session.grandTotal : null;

  return (
    <div className="order-detail-page">
      <div className="order-detail-header">
        <button className="back-button" onClick={() => navigate('/orders')}>
          ← Quay lại
        </button>

        <div className="order-header-card">
          <div className="order-header-left">
            <div className="header-label">ĐƠN HÀNG</div>
            <h1 className="order-number">#{order.id || order.orderId}</h1>
            <p className="order-time">🕒 {formatDate(order.createdAt || order.created_at)}</p>
          </div>
          <div className="order-header-right">
            <span className={`status-badge ${((order.assignmentStatus || order.assignment_status || order.status) || '').toString().toLowerCase().replace(/\s+/g,'-')}`}>
              { (order.assignmentStatus || order.assignment_status) ?
                  (order.assignmentStatus || order.assignment_status) :
                  (order.status || order.state || '') }
            </span>
          </div>
        </div>
      </div>

      <div className="order-detail-content">
        <div className="order-main-info">
          <section className="products-section">
            <div className="shop-header" onClick={handleShopHeaderClick} role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==='Enter') handleShopHeaderClick();}}>
              <span className="shop-name">{(order.shop && order.shop.name) || order.shopName || order.shop_name || 'Sản Phẩm'}</span>
            </div>
            {showProducts && (
              <div className="product-list">
                {order.orderItems?.map((item, index) => (
                  <div key={index} className="product-item">
                  <img 
                    src={item.productImage || item.image || item.imageUrl || '/placeholder.png'} 
                    alt={item.productName || item.name}
                    className="product-image"
                  />
                  <div className="product-info">
                    <h3>{item.productName || item.name}</h3>
                    <p>Số lượng: {item.quantity}</p>
                    <p className="product-price">{formatVND(item.unitPrice || item.unit_price || item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
            )}

            {(() => {
              const voucherDisplay = order.voucherCode || order.voucher_code || (order.voucherId ? `#${order.voucherId}` : (order.voucher_id ? `#${order.voucher_id}` : 'Không có'));
              let shippingDisplay = order.deliveryFee || order.delivery_fee || order.shippingFee || order.shipping_fee || 0;
              let isCodCollect = false;
              let codTotal = null;
              let sessionNote = null;
              if (session && Array.isArray(session.orders)) {
                const found = session.orders.find(o => String(o.orderId) === String(order.id));
                const collector = session.codCollectOrderId;
                if (found) {
                  if (!shippingDisplay && found.shippingAllocated !== undefined) {
                    shippingDisplay = found.shippingAllocated;
                  }
                }
                if (collector && String(collector) === String(order.id)) {
                  isCodCollect = true;
                  codTotal = session.grandTotal;
                } else if (collector) {
                  sessionNote = `Phí ship & COD đã gộp ở đơn #${collector}`;
                }
              }

              return (
                <div className="order-summary">
                  <div className="summary-line">
                    <span>Tiền hàng:</span>
                    <span>{formatVND(order.totalAmount || order.total_amount)}</span>
                  </div>
                  <div className="summary-line">
                    <span>Voucher:</span>
                    <span style={{color:'#16a34a'}}>{voucherDisplay}</span>
                  </div>
                  {shippingDisplay ? (
                    <div className="summary-line">
                      <span>Phí vận chuyển:</span>
                      <span>{formatVND(shippingDisplay)}</span>
                    </div>
                  ) : (
                    sessionNote && <div className="summary-line"><span>Phí vận chuyển:</span><span style={{color:'#6b7280'}}>{sessionNote}</span></div>
                  )}
                  {isCodCollect && codTotal !== null && (
                    <div className="summary-line total">
                      <span>Số tiền cần thu (COD):</span>
                      <span style={{fontWeight:'700', fontSize:'1.1em'}}>{formatVND(codTotal)}</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </section>

          <section className="order-timeline">
            <h2>Lịch Sử Đơn Hàng</h2>
            <div className="timeline">
              <div className="timeline-item completed">
                <div className="timeline-point"></div>
                <div className="timeline-content">
                  <h4>Đơn hàng được tạo</h4>
                  <p>{formatDate(order.createdAt || order.created_at)}</p>
                </div>
              </div>
              {(order.confirmed_at || order.confirmedAt) && (
                <div className="timeline-item completed">
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h4>Đơn hàng được xác nhận</h4>
                    <p>{formatDate(order.confirmedAt || order.confirmed_at)}</p>
                  </div>
                </div>
              )}
              {(order.processing_at || order.processingAt) && (
                <div className="timeline-item completed">
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h4>Đang chế biến</h4>
                    <p>{formatDate(order.processingAt || order.processing_at)}</p>
                  </div>
                </div>
              )}
              {(order.ready_at || order.readyAt) && (
                <div className="timeline-item completed">
                  <div className="timeline-point"></div>
                  <div className="timeline-content">
                    <h4>Sẵn sàng lấy</h4>
                    <p>{formatDate(order.readyAt || order.ready_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="order-side-info">
          <section className="delivery-info">
            <h2>Thông Tin Giao Hàng</h2>
            <div className="info-content">
              <div className="info-item">
                <label>Người nhận:</label>
                <p>{order.recipientName || order.recipient_name || '—'}</p>
              </div>
              <div className="info-item">
                <label>Số điện thoại:</label>
                <p>{order.recipientPhone || order.recipient_phone || '—'}</p>
              </div>
              <div className="info-item">
                <label>Địa chỉ:</label>
                <p>{order.addressText || order.delivery_address || '—'}</p>
              </div>
            </div>
          </section>

            <section className="confirmation-section payment-info">
              <h3>💳 Phương thức thanh toán</h3>
              <div className="info-card">
                <div className="info-item">
                  <strong>Phương thức:</strong>
                  <span>{paymentLabel}</span>
                </div>
                {isCollectorOrder && collectorTotal !== null && (
                  <div className="info-item">
                    <strong>Ghi chú:</strong>
                    <span className="payment-note">Đơn thu hộ (thu hộ COD cho các đơn ghép). Tổng cần thu: {formatVND(collectorTotal)}</span>
                  </div>
                )}
                <div className="info-item">
                  <strong>Trạng thái:</strong>
                  <span>{order.paymentStatus || order.payment_status || (order.status || '')}</span>
                </div>
              </div>
            </section>

          <div className="action-buttons">
            <button className="support-button">
              📞 Liên Hệ Hỗ Trợ
            </button>
            {order.status === 'PENDING' && (
              <button className="cancel-button" onClick={handleCancel}>
                ❌ Hủy Đơn Hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;