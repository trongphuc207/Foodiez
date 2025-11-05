import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [lowRatingShops, setLowRatingShops] = useState([]);
  const [showLowRating, setShowLowRating] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [banReason, setBanReason] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);

  const load = async () => {
    setErr('');
    try {
      const list = await adminAPI.getShops();
      setShops(list);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Không thể tải danh sách shop');
    }
  };

  const loadLowRating = async () => {
    setErr('');
    try {
      const list = await adminAPI.getLowRatingShops();
      setLowRatingShops(list);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Không thể tải shop rating thấp');
    }
  };

  useEffect(() => {
    load();
    loadLowRating();
  }, []);

  const handleBanShop = async (shopId, reason) => {
    if (!reason || reason.trim() === '') {
      setErr('Vui lòng nhập lý do ban shop');
      return;
    }
    
    setErr(''); setOk('');
    try {
      await adminAPI.banShop(shopId, { reason });
      setOk('Đã ban shop thành công');
      setSelectedShop(null);
      setBanReason('');
      await load();
      await loadLowRating();
      setTimeout(() => setOk(''), 3000);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Không thể ban shop');
    }
  };

  const handleUnbanShop = async (shopId) => {
    if (!window.confirm('Bạn có chắc muốn unban shop này?')) return;
    
    setErr(''); setOk('');
    try {
      await adminAPI.unbanShop(shopId);
      setOk('Đã unban shop thành công');
      await load();
      await loadLowRating();
      setTimeout(() => setOk(''), 3000);
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Không thể unban shop');
    }
  };

  const renderShopList = (list) => (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th style={{width: 60}}>ID</th>
            <th>Tên shop</th>
            <th>Seller</th>
            <th>Địa chỉ</th>
            <th style={{width: 100}}>Rating</th>
            <th style={{width: 120}}>Trạng thái</th>
            <th style={{width: 200}}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr><td colSpan={7} className="text-center">Không có shop nào.</td></tr>
          ) : list.map(shop => {
            const isBanned = shop.is_banned || shop.isBanned;
            const rating = shop.rating ?? 0;
            const isLowRating = rating < 2.5 && rating > 0;
            
            return (
              <tr key={shop.id} className={isBanned ? 'table-danger' : (isLowRating ? 'table-warning' : '')}>
                <td>{shop.id}</td>
                <td>
                  <strong>{shop.name}</strong>
                  {isBanned && <span className="badge bg-danger ms-2">Banned</span>}
                  {isLowRating && !isBanned && <span className="badge bg-warning text-dark ms-2">Low Rating</span>}
                </td>
                <td>
                  {shop.seller_name || shop.sellerName || '-'}
                  <br/>
                  <small className="text-muted">{shop.seller_email || shop.sellerEmail || ''}</small>
                </td>
                <td><small>{shop.address}</small></td>
                <td>
                  <span className={`badge ${rating >= 4 ? 'bg-success' : rating >= 2.5 ? 'bg-warning text-dark' : 'bg-danger'}`}>
                    {rating > 0 ? rating.toFixed(2) : 'N/A'} ⭐
                  </span>
                </td>
                <td>
                  {isBanned ? (
                    <div>
                      <span className="text-danger fw-bold">Đã ban</span>
                      {(shop.ban_reason || shop.banReason) && (
                        <div className="small text-muted mt-1">
                          Lý do: {shop.ban_reason || shop.banReason}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-success">Hoạt động</span>
                  )}
                </td>
                <td>
                  {isBanned ? (
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => handleUnbanShop(shop.id)}
                    >
                      Unban
                    </button>
                  ) : (
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => setSelectedShop(shop)}
                    >
                      Ban Shop
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      {err && <div className="alert alert-danger" role="alert">{err}</div>}
      {ok && <div className="alert alert-success" role="alert">{ok}</div>}
      
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2>Quản lý Shop</h2>
        <div className="d-flex gap-2">
          <button 
            className={`btn btn-sm ${showLowRating ? 'btn-outline-warning' : 'btn-warning'}`}
            onClick={() => setShowLowRating(!showLowRating)}
          >
            {showLowRating ? 'Hiện tất cả' : `Shop rating < 2.5 (${lowRatingShops.length})`}
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => { load(); loadLowRating(); }}>
            Tải lại
          </button>
        </div>
      </div>

      {/* Ban Modal */}
      {selectedShop && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={() => setSelectedShop(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ban Shop: {selectedShop.name}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedShop(null)}></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <strong>Cảnh báo:</strong> Shop sẽ bị ban và không thể hoạt động.
                </div>
                <div className="mb-3">
                  <label className="form-label">Lý do ban shop *</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="VD: Rating dưới 2.5 sao, nhiều khiếu nại từ khách hàng, địa chỉ không đúng..."
                  ></textarea>
                </div>
                <div className="text-muted small">
                  <strong>Thông tin shop:</strong><br/>
                  Rating: {selectedShop.rating?.toFixed(2) || 'N/A'}<br/>
                  Địa chỉ: {selectedShop.address}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedShop(null)}>
                  Hủy
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleBanShop(selectedShop.id, banReason)}
                >
                  Xác nhận Ban
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLowRating ? (
        <div>
          <h4 className="mb-3">
            <span className="badge bg-warning text-dark">Shop có rating &lt; 2.5 ⭐</span>
          </h4>
          {renderShopList(lowRatingShops)}
        </div>
      ) : (
        renderShopList(shops)
      )}
    </div>
  );
}
