import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { productAPI, testServerConnection } from '../../api/product';
import { shopAPI } from '../../api/shop';
import './ShopManagement.css';

const ShopManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('products');
  const [showShopForm, setShowShopForm] = useState(false);

  const [shopForm, setShopForm] = useState({
    name: '',
    description: '',
    address: '',
    opening_hours: ''
  });

  // Scroll modal to top when opened
  useEffect(() => {
    if (showShopForm) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showShopForm]);

  // Fetch shop data
  const { data: shopData, isLoading: shopLoading } = useQuery({
    queryKey: ['shop', user?.id],
    queryFn: () => shopAPI.getShopBySellerId(user?.id),
    enabled: !!user?.id
  });

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', shopData?.data?.id],
    queryFn: () => productAPI.getProductsByShopId(shopData?.data?.id),
    enabled: !!shopData?.data?.id
  });

  // Test server connection on mount
  useEffect(() => {
    const testConnection = async () => {
      const isConnected = await testServerConnection();
      if (!isConnected) {
        console.warn('⚠️ Server connection test failed');
      }
    };
    testConnection();
  }, []);



  const deleteProductMutation = useMutation({
    mutationFn: productAPI.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      alert('✅ Xóa món ăn thành công!');
    },
    onError: (error) => {
      console.error('❌ Delete product error:', error);
      alert('❌ Lỗi khi xóa món ăn: ' + error.message);
    }
  });

  const updateShopMutation = useMutation({
    mutationFn: ({ id, data }) => {
      console.log('📤 Updating shop:', id, 'with data:', data);
      return shopAPI.updateShop(id, data);
    },
    onSuccess: () => {
      console.log('✅ Shop updated successfully');
      queryClient.invalidateQueries(['shop']);
      setShowShopForm(false);
      alert('✅ Cập nhật thông tin cửa hàng thành công!');
    },
    onError: (error) => {
      console.error('❌ Update shop error:', error);
      alert('❌ Lỗi khi cập nhật thông tin cửa hàng: ' + error.message);
    }
  });

  // Load shop data into form
  useEffect(() => {
    if (shopData?.data) {
      setShopForm({
        name: shopData.data.name || '',
        description: shopData.data.description || '',
        address: shopData.data.address || '',
        opening_hours: shopData.data.opening_hours || ''
      });
    }
  }, [shopData]);


  const handleShopSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!shopForm.name.trim()) {
      alert('❌ Vui lòng nhập tên cửa hàng');
      return;
    }
    
    if (!shopForm.address.trim()) {
      alert('❌ Vui lòng nhập địa chỉ');
      return;
    }
    
    // Only send fields that should be updated (exclude seller_id)
    const updateData = {
      name: shopForm.name.trim(),
      description: shopForm.description.trim(),
      address: shopForm.address.trim(),
      opening_hours: shopForm.opening_hours.trim()
    };
    
    console.log('📤 Submitting shop update:', updateData);
    updateShopMutation.mutate({ id: shopData?.data?.id, data: updateData });
  };

  const handleEditProduct = (product) => {
    navigate(`/shop-management/products/${product.id}/edit`);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
      deleteProductMutation.mutate(productId);
    }
  };


  if (shopLoading) {
    return <div className="loading">Đang tải thông tin cửa hàng...</div>;
  }

  if (!shopData?.data) {
    return (
      <div className="shop-management">
        <div className="no-shop">
          <h2>Bạn chưa có cửa hàng</h2>
          <p>Vui lòng đăng ký cửa hàng trước khi sử dụng chức năng quản lý.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-management">
      <div className="shop-header">
        <h1>Quản lý cửa hàng: {shopData.data.name}</h1>
        <div className="shop-stats">
          <div className="stat-item">
            <span className="stat-label">Đánh giá:</span>
            <span className="stat-value">{shopData.data.rating || 0} ⭐</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Số món ăn:</span>
            <span className="stat-value">{productsData?.data?.length || 0}</span>
          </div>
        </div>
      </div>

      <div className="management-tabs">
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          🍽️ Quản lý món ăn
        </button>
        <button 
          className={`tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          🏪 Thông tin cửa hàng
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ratings' ? 'active' : ''}`}
          onClick={() => setActiveTab('ratings')}
        >
          ⭐ Đánh giá khách hàng
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="products-section">
          <div className="section-header">
            <h2>Danh sách món ăn</h2>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/shop-management/products/new')}
            >
              ➕ Thêm món ăn
            </button>
          </div>

          <div className="products-list">
            {productsLoading ? (
              <div className="loading">Đang tải danh sách món ăn...</div>
            ) : productsData?.data?.length > 0 ? (
              productsData.data.map(product => (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => handleEditProduct(product)}
                >
                  <div className="product-image">
                    {product.imageUrl || product.image_url || product.image ? (
                      <img 
                        src={product.imageUrl || product.image_url || product.image} 
                        alt={product.name}
                        onError={(e) => {
                          console.log('❌ Image load error in shop management:', product.name);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="no-image"
                      style={{ display: product.imageUrl || product.image_url || product.image ? 'none' : 'flex' }}
                    >
                      <div className="no-image-content">
                        <div className="no-image-icon">🍽️</div>
                        <span>Không có ảnh</span>
                      </div>
                    </div>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="product-details">
                      <span className="price">{product.price.toLocaleString()} VNĐ</span>
                      <span className="category">{product.category?.name}</span>
                    </div>
                    <div className="product-status">
                      <span className={`status ${product.status === 'active' ? 'available' : 'unavailable'}`}>
                        {product.status === 'active' ? '✅ Còn hàng' : 
                         product.status === 'inactive' ? '⏸️ Tạm ngừng' : 
                         product.status === 'out_of_stock' ? '🚫 Hết nguyên liệu' : '❌ Không xác định'}
                      </span>
                    </div>
                  </div>
                  <div className="product-actions">
                    <button 
                      className="btn btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProduct(product);
                      }}
                    >
                      ✏️ Sửa
                    </button>
                    <button 
                      className="btn btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product.id);
                      }}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-products">
                <p>Chưa có món ăn nào. Hãy thêm món ăn đầu tiên!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'shop' && (
        <div className="shop-section">
          <div className="section-header">
            <h2>Thông tin cửa hàng</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowShopForm(true)}
            >
              ✏️ Cập nhật thông tin
            </button>
          </div>

          {showShopForm && (
            <div className="modal-overlay" onClick={() => setShowShopForm(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button 
                  type="button"
                  className="modal-close-btn" 
                  onClick={() => setShowShopForm(false)}
                >
                  ✕
                </button>
                <h3>Cập nhật thông tin cửa hàng</h3>
                <form onSubmit={handleShopSubmit}>
                  <div className="form-group">
                    <label>Tên cửa hàng:</label>
                    <input
                      type="text"
                      value={shopForm.name}
                      onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mô tả:</label>
                    <textarea
                      value={shopForm.description}
                      onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ:</label>
                    <input
                      type="text"
                      value={shopForm.address}
                      onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Giờ mở cửa:</label>
                    <input
                      type="text"
                      value={shopForm.opening_hours}
                      onChange={(e) => setShopForm({ ...shopForm, opening_hours: e.target.value })}
                      placeholder="Ví dụ: 8AM-10PM"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowShopForm(false)}>
                      Hủy
                    </button>
                    <button type="submit" disabled={updateShopMutation.isPending}>
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="shop-info">
            <div className="info-card">
              <h3>Thông tin cơ bản</h3>
              <div className="info-item">
                <span className="label">Tên cửa hàng:</span>
                <span className="value">{shopData.data.name}</span>
              </div>
              <div className="info-item">
                <span className="label">Mô tả:</span>
                <span className="value">{shopData.data.description || 'Chưa có mô tả'}</span>
              </div>
              <div className="info-item">
                <span className="label">Địa chỉ:</span>
                <span className="value">{shopData.data.address}</span>
              </div>
              <div className="info-item">
                <span className="label">Giờ mở cửa:</span>
                <span className="value">{shopData.data.opening_hours || 'Chưa cập nhật'}</span>
              </div>
              <div className="info-item">
                <span className="label">Đánh giá trung bình:</span>
                <span className="value">{shopData.data.rating || 0} ⭐</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ratings' && (
        <div className="ratings-section">
          <div className="section-header">
            <h2>Đánh giá từ khách hàng</h2>
          </div>
          <div className="ratings-summary">
            <div className="rating-card">
              <h3>Đánh giá tổng quan</h3>
              <div className="rating-stats">
                <div className="rating-item">
                  <span className="rating-label">Đánh giá trung bình:</span>
                  <span className="rating-value">{shopData.data.rating || 0} ⭐</span>
                </div>
                <div className="rating-item">
                  <span className="rating-label">Tổng số đánh giá:</span>
                  <span className="rating-value">{shopData.data.totalRatings || 0}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ratings-list">
            <p>Chức năng xem chi tiết đánh giá sẽ được phát triển trong tương lai.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopManagement;
