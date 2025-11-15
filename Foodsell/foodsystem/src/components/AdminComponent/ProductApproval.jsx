import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import './ProductApproval.css';

export default function ProductApproval() {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' | 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setErr('');
    setIsLoading(true);
    try {
      const list = await adminAPI.getPendingProducts();
      setProducts(list);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (productId) => {
    setErr(''); setOk('');
    try {
      await adminAPI.approveProduct(productId);
      setOk('✅ Đã duyệt sản phẩm thành công!');
      setSelectedProduct(null);
      await load();
      setTimeout(() => setOk(''), 4000);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Không thể duyệt sản phẩm');
    }
  };

  const handleReject = async (productId, reason) => {
    if (!reason || reason.trim() === '') {
      setErr('⚠️ Vui lòng nhập lý do từ chối');
      return;
    }
    
    setErr(''); setOk('');
    try {
      await adminAPI.rejectProduct(productId, { reason });
      setOk('✅ Đã từ chối sản phẩm');
      setSelectedProduct(null);
      setRejectionReason('');
      await load();
      setTimeout(() => setOk(''), 4000);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Không thể từ chối sản phẩm');
    }
  };

  const openModal = (product, type) => {
    setSelectedProduct(product);
    setActionType(type);
    setRejectionReason('');
    setErr('');
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setActionType('');
    setRejectionReason('');
  };

  const confirmAction = () => {
    if (actionType === 'approve') {
      handleApprove(selectedProduct.id);
    } else if (actionType === 'reject') {
      handleReject(selectedProduct.id, rejectionReason);
    }
  };

  // Filter products by status
  const pendingProducts = products.filter(p => 
    (p.approval_status || p.approvalStatus) === 'pending'
  );
  
  const approvedProducts = products.filter(p => 
    (p.approval_status || p.approvalStatus) === 'approved'
  );
  
  const rejectedProducts = products.filter(p => 
    (p.approval_status || p.approvalStatus) === 'rejected'
  );

  // Get filtered products based on active tab and search
  const getFilteredProducts = () => {
    let filtered;
    switch(activeTab) {
      case 'pending':
        filtered = pendingProducts;
        break;
      case 'approved':
        filtered = approvedProducts;
        break;
      case 'rejected':
        filtered = rejectedProducts;
        break;
      default:
        filtered = products;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.shop_name || p.shopName || '').toLowerCase().includes(query) ||
        (p.category_name || p.categoryName || '').toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderProductCard = (product) => {
    const status = product.approval_status || product.approvalStatus;
    const imageUrl = product.image_url || product.imageUrl;
    const shopName = product.shop_name || product.shopName;
    const categoryName = product.category_name || product.categoryName;
    const rejectionReason = product.rejection_reason || product.rejectionReason;
    const createdAt = product.created_at || product.createdAt;

    return (
      <div key={product.id} className="product-approval-card">
        <div className="product-card-content">
          {/* Image Section */}
          <div className="product-image-container">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={product.name}
                className="product-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="product-no-image">
                <span>📷</span>
                <p>Chưa có ảnh</p>
              </div>
            )}
            {/* Status Badge on Image */}
            <div className={`status-badge status-${status}`}>
              {status === 'pending' && '⏳ Chờ duyệt'}
              {status === 'approved' && '✅ Đã duyệt'}
              {status === 'rejected' && '❌ Từ chối'}
            </div>
          </div>

          {/* Info Section */}
          <div className="product-info-section">
            <div className="product-header">
              <h3 className="product-name">{product.name}</h3>
              <span className="product-id">ID: #{product.id}</span>
            </div>

            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-icon">🏪</span>
                <div className="meta-content">
                  <span className="meta-label">Shop</span>
                  <span className="meta-value">{shopName || 'N/A'}</span>
                </div>
              </div>

              <div className="meta-item">
                <span className="meta-icon">📂</span>
                <div className="meta-content">
                  <span className="meta-label">Danh mục</span>
                  <span className="meta-value">{categoryName || 'N/A'}</span>
                </div>
              </div>

              <div className="meta-item">
                <span className="meta-icon">💰</span>
                <div className="meta-content">
                  <span className="meta-label">Giá</span>
                  <span className="meta-value price">{formatPrice(product.price)}</span>
                </div>
              </div>

              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <div className="meta-content">
                  <span className="meta-label">Ngày tạo</span>
                  <span className="meta-value">{formatDate(createdAt)}</span>
                </div>
              </div>
            </div>

            {product.description && (
              <div className="product-description">
                <p>{product.description.length > 150 ? product.description.substring(0, 150) + '...' : product.description}</p>
              </div>
            )}

            {status === 'rejected' && rejectionReason && (
              <div className="rejection-reason">
                <strong>❌ Lý do từ chối:</strong>
                <p>{rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="product-actions">
            {status === 'pending' ? (
              <>
                <button 
                  className="action-btn approve-btn"
                  onClick={() => openModal(product, 'approve')}
                  title="Duyệt sản phẩm"
                >
                  <span className="btn-icon">✓</span>
                  <span className="btn-text">Duyệt</span>
                </button>
                <button 
                  className="action-btn reject-btn"
                  onClick={() => openModal(product, 'reject')}
                  title="Từ chối sản phẩm"
                >
                  <span className="btn-icon">✗</span>
                  <span className="btn-text">Từ chối</span>
                </button>
              </>
            ) : (
              <button 
                className="action-btn view-btn"
                onClick={() => openModal(product, 'view')}
              >
                <span className="btn-icon">👁</span>
                <span className="btn-text">Xem chi tiết</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="admin-page">
    <div className="product-approval-container">
      {/* Header Section */}
      <div className="approval-header">
        <div className="header-left">
          <h1 className="page-title">
            <span className="title-icon">📋</span>
            Quản lý duyệt sản phẩm
          </h1>
          <p className="page-subtitle">Kiểm duyệt và phê duyệt sản phẩm từ các shop</p>
        </div>
        <div className="header-right">
          <button 
            className="refresh-btn"
            onClick={load}
            disabled={isLoading}
          >
            <span className="btn-icon">{isLoading ? '⏳' : '🔄'}</span>
            <span className="btn-text">{isLoading ? 'Đang tải...' : 'Tải lại'}</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {err && (
        <div className="alert-banner alert-error">
          <span className="alert-icon">⚠️</span>
          <span className="alert-message">{err}</span>
          <button className="alert-close" onClick={() => setErr('')}>×</button>
        </div>
      )}
      {ok && (
        <div className="alert-banner alert-success">
          <span className="alert-icon">✅</span>
          <span className="alert-message">{ok}</span>
          <button className="alert-close" onClick={() => setOk('')}>×</button>
        </div>
      )}

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-icon">⏳</span>
          <div className="stat-content">
            <span className="stat-value">{pendingProducts.length}</span>
            <span className="stat-label">Chờ duyệt</span>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">✅</span>
          <div className="stat-content">
            <span className="stat-value">{approvedProducts.length}</span>
            <span className="stat-label">Đã duyệt</span>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">❌</span>
          <div className="stat-content">
            <span className="stat-value">{rejectedProducts.length}</span>
            <span className="stat-label">Từ chối</span>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-icon">📦</span>
          <div className="stat-content">
            <span className="stat-value">{products.length}</span>
            <span className="stat-label">Tổng số</span>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        {/* Tabs */}
        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <span className="tab-icon">⏳</span>
            <span className="tab-label">Chờ duyệt</span>
            {pendingProducts.length > 0 && (
              <span className="tab-badge">{pendingProducts.length}</span>
            )}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            <span className="tab-icon">✅</span>
            <span className="tab-label">Đã duyệt</span>
            {approvedProducts.length > 0 && (
              <span className="tab-badge">{approvedProducts.length}</span>
            )}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            <span className="tab-icon">❌</span>
            <span className="tab-label">Từ chối</span>
            {rejectedProducts.length > 0 && (
              <span className="tab-badge">{rejectedProducts.length}</span>
            )}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span className="tab-icon">📦</span>
            <span className="tab-label">Tất cả</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input 
            type="text"
            className="search-input"
            placeholder="Tìm kiếm sản phẩm, shop, danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="search-clear"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>Không có sản phẩm nào</h3>
            <p>
              {searchQuery 
                ? `Không tìm thấy sản phẩm với từ khóa "${searchQuery}"`
                : `Không có sản phẩm nào ${activeTab === 'pending' ? 'chờ duyệt' : activeTab === 'approved' ? 'đã duyệt' : activeTab === 'rejected' ? 'bị từ chối' : ''}`
              }
            </p>
          </div>
        ) : (
          filteredProducts.map(p => renderProductCard(p))
        )}
      </div>

      {/* Action Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {actionType === 'approve' && '✅ Duyệt sản phẩm'}
                {actionType === 'reject' && '❌ Từ chối sản phẩm'}
                {actionType === 'view' && '👁 Chi tiết sản phẩm'}
              </h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-product-details">
                <div className="modal-image">
                  {(selectedProduct.image_url || selectedProduct.imageUrl) ? (
                    <img 
                      src={selectedProduct.image_url || selectedProduct.imageUrl} 
                      alt={selectedProduct.name}
                    />
                  ) : (
                    <div className="modal-no-image">
                      <span>📷</span>
                      <p>Chưa có ảnh</p>
                    </div>
                  )}
                </div>

                <div className="modal-info">
                  <h3>{selectedProduct.name}</h3>
                  <div className="modal-meta">
                    <div className="modal-meta-item">
                      <strong>🏪 Shop:</strong>
                      <span>{selectedProduct.shop_name || selectedProduct.shopName}</span>
                    </div>
                    <div className="modal-meta-item">
                      <strong>📂 Danh mục:</strong>
                      <span>{selectedProduct.category_name || selectedProduct.categoryName}</span>
                    </div>
                    <div className="modal-meta-item">
                      <strong>💰 Giá:</strong>
                      <span className="price">{formatPrice(selectedProduct.price)}</span>
                    </div>
                    <div className="modal-meta-item">
                      <strong>📅 Ngày tạo:</strong>
                      <span>{formatDate(selectedProduct.created_at || selectedProduct.createdAt)}</span>
                    </div>
                  </div>
                  {selectedProduct.description && (
                    <div className="modal-description">
                      <strong>📝 Mô tả:</strong>
                      <p>{selectedProduct.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {actionType === 'reject' && (
                <div className="rejection-input">
                  <label className="input-label">
                    <span className="label-icon">✍️</span>
                    Lý do từ chối <span className="required">*</span>
                  </label>
                  <textarea 
                    className="textarea-input"
                    rows="4"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="VD: Hình ảnh không rõ ràng, thông tin sản phẩm chưa đầy đủ, vi phạm chính sách..."
                  ></textarea>
                </div>
              )}

              {actionType === 'approve' && (
                <div className="approval-notice">
                  <span className="notice-icon">ℹ️</span>
                  <div className="notice-content">
                    <strong>Lưu ý:</strong>
                    <p>Sau khi duyệt, sản phẩm sẽ được hiển thị công khai trên hệ thống và khách hàng có thể đặt mua.</p>
                  </div>
                </div>
              )}
            </div>

            {actionType !== 'view' && (
              <div className="modal-footer">
                <button 
                  className="modal-btn cancel-btn"
                  onClick={closeModal}
                >
                  Hủy bỏ
                </button>
                <button 
                  className={`modal-btn ${actionType === 'approve' ? 'confirm-approve-btn' : 'confirm-reject-btn'}`}
                  onClick={confirmAction}
                >
                  {actionType === 'approve' ? '✅ Xác nhận Duyệt' : '❌ Xác nhận Từ chối'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
