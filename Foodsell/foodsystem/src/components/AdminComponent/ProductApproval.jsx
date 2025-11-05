import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';

export default function ProductApproval() {
  const [products, setProducts] = useState([]);
  const [showPending, setShowPending] = useState(true);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' | 'reject'
  const [rejectionReason, setRejectionReason] = useState('');

  const load = async () => {
    setErr('');
    try {
      const list = await adminAPI.getPendingProducts();
      setProducts(list);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Không thể tải danh sách sản phẩm');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (productId) => {
    setErr(''); setOk('');
    try {
      await adminAPI.approveProduct(productId);
      setOk('Đã duyệt sản phẩm thành công!');
      setSelectedProduct(null);
      await load();
      setTimeout(() => setOk(''), 3000);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Không thể duyệt sản phẩm');
    }
  };

  const handleReject = async (productId, reason) => {
    if (!reason || reason.trim() === '') {
      setErr('Vui lòng nhập lý do từ chối');
      return;
    }
    
    setErr(''); setOk('');
    try {
      await adminAPI.rejectProduct(productId, { reason });
      setOk('Đã từ chối sản phẩm');
      setSelectedProduct(null);
      setRejectionReason('');
      await load();
      setTimeout(() => setOk(''), 3000);
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

  const pendingProducts = products.filter(p => 
    (p.approval_status || p.approvalStatus) === 'pending'
  );
  
  const processedProducts = products.filter(p => 
    (p.approval_status || p.approvalStatus) !== 'pending'
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const renderProductCard = (product) => {
    const status = product.approval_status || product.approvalStatus;
    const statusColor = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };

    const statusText = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối'
    };

    const imageUrl = product.image_url || product.imageUrl;
    const shopName = product.shop_name || product.shopName;
    const categoryName = product.category_name || product.categoryName;
    const rejectionReason = product.rejection_reason || product.rejectionReason;

    return (
      <div key={product.id} className="card mb-3">
        <div className="card-body">
          <div className="row">
            <div className="col-md-2">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={product.name}
                  className="img-fluid rounded"
                  style={{maxHeight: 120, objectFit: 'cover'}}
                />
              ) : (
                <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{height: 120}}>
                  <span className="text-muted">No image</span>
                </div>
              )}
            </div>

            <div className="col-md-7">
              <h5 className="card-title">
                {product.name}
                <span className={`badge bg-${statusColor[status]} ms-2`}>
                  {statusText[status]}
                </span>
              </h5>
              
              <div className="mb-2">
                <strong>Shop:</strong> {shopName}<br/>
                <strong>Danh mục:</strong> {categoryName}<br/>
                <strong>Giá:</strong> {formatPrice(product.price)}
              </div>

              <div className="text-muted small">
                {product.description}
              </div>

              {status === 'rejected' && rejectionReason && (
                <div className="alert alert-danger mt-2 mb-0">
                  <strong>Lý do từ chối:</strong> {rejectionReason}
                </div>
              )}
            </div>

            <div className="col-md-3 d-flex align-items-center justify-content-end">
              {status === 'pending' && (
                <div className="d-flex flex-column gap-2">
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => openModal(product, 'approve')}
                  >
                    ✓ Duyệt
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => openModal(product, 'reject')}
                  >
                    ✗ Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {err && <div className="alert alert-danger" role="alert">{err}</div>}
      {ok && <div className="alert alert-success" role="alert">{ok}</div>}
      
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2>Duyệt sản phẩm</h2>
        <div className="d-flex gap-2">
          <button 
            className={`btn btn-sm ${showPending ? 'btn-warning' : 'btn-outline-warning'}`}
            onClick={() => setShowPending(!showPending)}
          >
            {showPending ? 'Hiện tất cả' : `Chờ duyệt (${pendingProducts.length})`}
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={load}>
            Tải lại
          </button>
        </div>
      </div>

      {showPending ? (
        <div>
          <h4>
            <span className="badge bg-warning text-dark">
              Sản phẩm chờ duyệt ({pendingProducts.length})
            </span>
          </h4>
          {pendingProducts.length === 0 ? (
            <div className="alert alert-info">Không có sản phẩm nào chờ duyệt</div>
          ) : (
            pendingProducts.map(p => renderProductCard(p))
          )}
        </div>
      ) : (
        <div>
          <h4 className="mb-3">Tất cả sản phẩm ({products.length})</h4>
          {products.length === 0 ? (
            <div className="alert alert-info">Không có sản phẩm nào</div>
          ) : (
            products.map(p => renderProductCard(p))
          )}
        </div>
      )}

      {/* Action Modal */}
      {selectedProduct && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={closeModal}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {actionType === 'approve' ? '✓ Duyệt sản phẩm' : '✗ Từ chối sản phẩm'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-3">
                    {(selectedProduct.image_url || selectedProduct.imageUrl) ? (
                      <img 
                        src={selectedProduct.image_url || selectedProduct.imageUrl} 
                        alt={selectedProduct.name}
                        className="img-fluid rounded"
                      />
                    ) : (
                      <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{height: 150}}>
                        <span className="text-muted">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="col-md-9">
                    <h5>{selectedProduct.name}</h5>
                    <div className="mb-2">
                      <strong>Shop:</strong> {selectedProduct.shop_name || selectedProduct.shopName}<br/>
                      <strong>Danh mục:</strong> {selectedProduct.category_name || selectedProduct.categoryName}<br/>
                      <strong>Giá:</strong> {formatPrice(selectedProduct.price)}
                    </div>
                    <div className="text-muted">
                      {selectedProduct.description}
                    </div>
                  </div>
                </div>

                {actionType === 'reject' && (
                  <div className="mb-3">
                    <label className="form-label">Lý do từ chối *</label>
                    <textarea 
                      className="form-control" 
                      rows="3"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="VD: Hình ảnh không phù hợp, thông tin sản phẩm sai, vi phạm chính sách..."
                    ></textarea>
                  </div>
                )}

                {actionType === 'approve' && (
                  <div className="alert alert-success">
                    <strong>Sau khi duyệt:</strong> Sản phẩm sẽ được hiển thị công khai và khách hàng có thể đặt mua.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button 
                  type="button" 
                  className={`btn btn-${actionType === 'approve' ? 'success' : 'danger'}`}
                  onClick={confirmAction}
                >
                  {actionType === 'approve' ? 'Xác nhận Duyệt' : 'Xác nhận Từ chối'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
