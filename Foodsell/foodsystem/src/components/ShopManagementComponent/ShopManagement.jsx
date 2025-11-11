import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { productAPI, testServerConnection } from '../../api/product';
import { shopAPI } from '../../api/shop';
import categoryAPI from '../../api/category';
import ImageUpload from '../AdminComponent/ImageUpload';
import OrdersList from './OrdersList';
import { reviewAPI } from '../../api/review';
import StarRating from '../ReviewComponent/StarRating';
import ReviewReply from '../ReviewComponent/ReviewReply';
import { chatAPI } from '../../api/chat';
import './ShopManagement.css';
const ShopManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('products');
  const [showShopForm, setShowShopForm] = useState(false);
  const [orderStatus, setOrderStatus] = useState('all'); // Filter orders by status
  const [showRatings, setShowRatings] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: null,
    is_available: true,
    status: 'active'
  });
  // Image upload states
  const [productImageUrl, setProductImageUrl] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products', shopData?.data?.id],
    queryFn: () => productAPI.getProductsByShopId(shopData?.data?.id),
    enabled: !!shopData?.data?.id
  });
  // Reviews: stats + list for this shop (seller view)
  const shopId = shopData?.data?.id;
  const { data: reviewStatsData } = useQuery({
    queryKey: ['shopReviewStats', shopId],
    queryFn: () => reviewAPI.getShopReviewStats(shopId),
    enabled: !!shopId,
    staleTime: 60_000,
  });
  const { data: shopReviewsData, isLoading: shopReviewsLoading } = useQuery({
    queryKey: ['shopReviews', shopId],
    queryFn: () => reviewAPI.getShopReviews(shopId),
    enabled: !!shopId,
  });
  // Map productId -> product name for reviews
  const [reviewProductMap, setReviewProductMap] = useState({});
  // Preload all products of this shop for name resolution
  useEffect(() => {
    if (!shopId) return;
    (async () => {
      try {
        const res = await productAPI.getProductsByShopId(shopId);
        const products = res?.data || res || [];
        const map = {};
        (products || []).forEach(p => {
          const id = p.id ?? p.productId;
          const name = p.name ?? p.productName;
          if (id) map[id] = name || `#${id}`;
        });
        if (Object.keys(map).length) setReviewProductMap(map);
      } catch {}
    })();
  }, [shopId]);
  // Reply to a customer review (seller)
  const handleReplyToReview = async (reviewId, content) => {
    try {
      const res = await reviewAPI.replyToReview(reviewId, content);
      if (res?.success) {
        // refresh replies/reviews
        queryClient.invalidateQueries(['shopReviews', shopId]);
        return true;
      } else {
        throw new Error(res?.message || 'Reply failed');
      }
    } catch (e) {
      console.error('Reply error:', e);
      throw e;
    }
  };
  useEffect(() => {
    const list = shopReviewsData?.data;
    if (!list || !Array.isArray(list)) return;
    const ids = Array.from(new Set(list
      .map(r => r.productId)
      .filter(id => typeof id === 'number' && id > 0 && !reviewProductMap[id])));
    if (ids.length === 0) return;
    (async () => {
      try {
        const results = await Promise.all(ids.map(async (pid) => {
          try {
            const res = await productAPI.getProductById(pid);
            const name = res?.data?.name || res?.name || `#${pid}`;
            return [pid, name];
          } catch {
            return [pid, `#${pid}`];
          }
        }));
        setReviewProductMap(prev => {
          const next = { ...prev };
          results.forEach(([pid, name]) => { next[pid] = name; });
          return next;
        });
      } catch {}
    })();
  }, [shopReviewsData]);
  // Fetch categories with fallback data
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        return await categoryAPI.getAllCategories();
      } catch (error) {
        console.error('Ă¢Â�Å’ Categories API error:', error);
        // Return fallback data if API fails
        return {
          success: true,
          data: [
            { id: 1, name: 'Phở',      description: 'Vietnamese noodle soup' },
            { id: 2, name: 'Bánh mì',  description: 'Vietnamese sandwich' },
            { id: 3, name: 'Cơm',      description: 'Rice dishes' },
            { id: 4, name: 'Nước uống', description: 'Beverages' },
            { id: 5, name: 'Pizza',    description: 'Italian pizza' },
            { id: 6, name: 'Bún',      description: 'Vietnamese vermicelli' }
          ]
        };
      }
    },
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Debug log and handle fetch errors
  useEffect(() => {
    if (categoriesData) {
      console.log('📂 Categories loaded:', categoriesData);
    }
    if (categoriesError) {
      console.error('❌ Categories error:', categoriesError);
      // Thử lại sau 5 giây
      setTimeout(() => {
        queryClient.invalidateQueries(['categories']);
      }, 5000);
    }
  }, [categoriesData, categoriesError]);

  // Thêm xử lý lỗi cho products
  useEffect(() => {
    if (productsError) {
      console.error('❌ Products error:', productsError);
      // Thử lại sau 5 giây
      setTimeout(() => {
        queryClient.invalidateQueries(['products']);
      }, 5000);
    }
  }, [productsError]);

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
  // Mutations
const createProductMutation = useMutation({
  mutationFn: productAPI.createProduct,
  onSuccess: () => {
    queryClient.invalidateQueries(['products']);
    setShowProductForm(false);
    setProductForm({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      image: null,
      is_available: true,
      status: 'active',
    });
    alert('✅ Thêm món ăn thành công!');
  },
  onError: (error) => {
    console.error('❗ Create product error:', error);
    alert('❗ Lỗi khi thêm món ăn: ' + error.message);
  },
});

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const maxRetries = 5;
      let lastError = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Attempt ${attempt}/${maxRetries} for product ${id}`);
          
          // Add delay between attempts
          if (attempt > 1) {
            const delay = Math.pow(2, attempt - 2) * 1000; // 1s, 2s, 4s, 8s
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          // Try with full data first
          if (attempt === 1) {
            return await productAPI.updateProduct(id, data);
          } else {
            // Try with minimal data on retry
            const minimalData = {
              name: data.name,
              description: data.description || '',
              price: data.price,
              categoryId: data.categoryId,
              shopId: data.shopId
            };
            
            console.log(`Attempt ${attempt} with minimal data:`, minimalData);
            return await productAPI.updateProduct(id, minimalData);
          }
        } catch (error) {
          lastError = error;
          console.error(`Attempt ${attempt} failed:`, error);
          
          // If it's a network error, continue to retry
          if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
            console.log('Network error detected, will retry...');
            continue;
          }
          
          // If it's a server error, try with even more minimal data
          if (error.message.includes('500') || error.message.includes('Internal server error')) {
            console.log('Server error detected, trying with ultra-minimal data...');
            try {
              const ultraMinimalData = {
                name: data.name,
                price: data.price,
                categoryId: data.categoryId,
                shopId: data.shopId
              };
              return await productAPI.updateProduct(id, ultraMinimalData);
            } catch (ultraMinimalError) {
              console.error('Ultra-minimal data attempt also failed:', ultraMinimalError);
              lastError = ultraMinimalError;
            }
          }
        }
      }
      
      // All attempts failed
      throw lastError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', categoryId: '', image: null, is_available: true, status: 'active' });
      alert('Cập nhật món ăn thành công!');
    },
    onError: (error) => {
      console.error('Update product error:', error);
      
      // Check if it's a server connection issue
      if (error.message.includes('Network error') || error.message.includes('Failed to fetch') || error.message.includes('Cannot connect to server')) {
        alert('Không thể kết nối đến server!\n\n' + 'Vui lòng kiểm tra:\n' + '1. Server có đang chạy không? (Port 8080)\n' + '2. Kết nối internet\n' + '3. Thử reload (refresh) trang\n' + '4. Kiểm tra console để xem chi tiết lỗi');
      } else if (error.message.includes('500') || error.message.includes('Internal server error')) {
        alert('Lỗi server!\n\n' + 'Vui lòng thử lại sau hoặc liên hệ admin.');
      } else if (error.message.includes('Server not responding properly')) {
        alert('Server không phản hồi đúng cách!\n\n' + 'Vui lòng kiểm tra server có đang chạy không.');
      } else {
        alert('Lỗi khi cập nhật món ăn: ' + error.message + '\n\nVui lòng thử lại hoặc liên hệ admin.');
      }
    }
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
      console.log('Updating shop:', id, 'with data:', data);
      return shopAPI.updateShop(id, data);
    },
    onSuccess: () => {
      console.log('Shop updated successfully');
      queryClient.invalidateQueries(['shop']);
      setShowShopForm(false);
      alert('Cập nhật thông tin cửa hàng thành công!');
    },
    onError: (error) => {
      console.error('Update shop error:', error);
      alert('Lỗi khi cập nhật thông tin cửa hàng: ' + error.message);
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
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!productForm.name.trim()) {
      alert('Vui lòng nhập tên món ăn');
      return;
    }
    if (!productForm.price || parseFloat(productForm.price) <= 0) {
      alert('Vui lòng nhập giá hợp lệ');
      return;
    }
    if (!productForm.categoryId) {
      alert('Vui lòng chọn danh mục');
      return;
    }
    
    const productData = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: parseFloat(productForm.price),
      categoryId: parseInt(productForm.categoryId),
      shopId: shopData?.data?.id,
      is_available: productForm.is_available,
      status: productForm.status
    };
    // Validate data before sending
    if (!productData.name || !productData.price || !productData.categoryId || !productData.shopId) {
      alert('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường bắt buộc.');
      return;
    }
    console.log('Sending product data:', productData);
    try {
      let productResult;
      
      if (editingProduct) {
        // Update existing product
        productResult = await productAPI.updateProduct(editingProduct.id, productData);
      } else {
        // Create new product
        productResult = await productAPI.createProduct(productData);
      }
      
      // Upload image if provided
      if (productForm.image && productResult?.data?.id) {
        console.log('Uploading image for product:', productResult.data.id);
        setIsUploadingImage(true);
        try {
          const uploadResult = await productAPI.uploadProductImage(productResult.data.id, productForm.image);
          console.log('Image uploaded successfully:', uploadResult);
          setProductImageUrl(uploadResult.data?.imageUrl);
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          alert('Sản phẩm đã được tạo/cập nhật nhưng không thể tải ảnh lên. Vui lòng thử lại sau.');
        } finally {
          setIsUploadingImage(false);
        }
      }
      
      // Success
      queryClient.invalidateQueries(['products']);
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', categoryId: '', image: null, is_available: true, status: 'active' });
      setProductImageUrl(null);
      setIsUploadingImage(false);
      alert('Ă¢Å“â€¦ ' + (editingProduct ? 'Cập nhật' : 'Thêm') + ' món ăn thành công!');
      
    } catch (error) {
      console.error('Product operation failed:', error);
      alert('Lỗi khi' + (editingProduct ? 'cập nhật' : 'thêm') + ' món ăn: ' + error.message);
    }
  };


  const handleShopSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!shopForm.name.trim()) {
      alert('Vui lòng nhập tên cửa hàng');
      return;
    }
    
    if (!shopForm.address.trim()) {
      alert('Vui lòng nhập địa chỉ');
      return;
    }
    
    // Only send fields that should be updated (exclude seller_id)
    const updateData = {
      name: shopForm.name.trim(),
      description: shopForm.description.trim(),
      address: shopForm.address.trim(),
      opening_hours: shopForm.opening_hours.trim()
    };
    
    console.log('Submitting shop update:', updateData);
    updateShopMutation.mutate({ id: shopData?.data?.id, data: updateData });
  };
  const handleEditProduct = (product) => {
    // Navigate to edit page instead of showing modal
    navigate(`/shop-management/products/${product.id}/edit`);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
      deleteProductMutation.mutate(productId);
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file quá lớn. Tối đa 5MB.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Định dạng file không hợp lệ. Chỉ chấp nhận JPEG, PNG, GIF, WebP.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      console.log('Selected file:', file.name, 'Size:', file.size, 'Type:', file.type);
    }
    
    setProductForm({ ...productForm, image: file });
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
            <span className="stat-value">{(reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0).toFixed ? (reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0).toFixed(1) : (reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0)}</span>
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
          Quản lý món ăn
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Quản lý đơn hàng
        </button>
        <button
          className={`tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          Thông tin cửa hàng
        </button>
        <button
          className={`tab-btn ${activeTab === 'ratings' ? 'active' : ''}`}
          onClick={() => setActiveTab('ratings')}
        >
          Đánh giá khách hàng
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
              + Thêm món
            </button>
          </div>

          <div className="products-list">
            {productsLoading ? (
              <div className="loading">Đang tải danh sách món ăn...</div>
            ) : productsError ? (
              <div className="error-fetch-products">
                <h4>Không thể tải danh sách món ăn</h4>
                <p>Nguyên nhân: {productsError.message || 'Lỗi khi kết nối tới server'}</p>
                <p>Hành động gợi ý: hãy đăng nhập lại (nếu bạn là chủ cửa hàng) hoặc kiểm tra kết nối server.</p>
                <button className="btn" onClick={() => window.location.reload()}>Thử tải lại</button>
              </div>
            ) : productsData?.data?.length > 0 ? (
              productsData.data.map(product => (
                <div 
                  key={product.id} 
                  className="product-card-new"
                >
                  <div className="product-image-container">
                    {product.imageUrl || product.image_url || product.image ? (
                      <img 
                        className="product-image-new"
                        src={product.imageUrl || product.image_url || product.image} 
                        alt={product.name}
                        onError={(e) => {
                          console.log('Image load error in shop management:', product.name);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="no-image-new"
                      style={{ display: product.imageUrl || product.image_url || product.image ? 'none' : 'flex' }}
                    >
                      <span>🖼️</span>
                    </div>
                    {product.status === 'active' && (
                      <div className="stock-badge">CÒN HÀNG</div>
                    )}
                  </div>
                  <div className="product-content-new">
                    <h3 className="product-name-new">{product.name}</h3>
                    <p className="product-description-new">{product.description || 'Chưa có mô tả'}</p>
                    <div className="product-price-new">
                      <span className="price-amount">{product.price.toLocaleString()}</span>
                      <span className="price-currency"> VND</span>
                    </div>
                    <div className="product-actions-new">
                      <button 
                        className="btn-edit-new"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct(product);
                        }}
                        title="Sửa món ăn"
                      >
                        <span className="btn-icon">✏️</span>
                        <span className="btn-text">Sửa</span>
                      </button>
                    </div>
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
              onClick={() => setShowShopForm(true)}>Cập nhật thông tin</button>
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
                <span className="value">{shopData.data.description}</span>
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
                <span className="value">{(reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0).toFixed ? (reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0).toFixed(1) : (reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="orders-section">
          <div className="section-header">
            <h2>Quản lý đơn hàng</h2>
          </div>
          <OrdersList 
            shopId={shopData.data.id} 
            status={orderStatus} 
            onStatusChange={setOrderStatus} 
          />
        </div>
      )}

      {activeTab === 'ratings' && (
        <div className="ratings-section">
          <div className="section-header">
            <h2>Đánh giá từ khách hàng</h2>
          </div>
          {/* Real data summary + list */}
          <div className="ratings-summary real">
            <div className="rating-card">
              <h3>Đánh giá tổng quan</h3>
              <div className="rating-stats">
                <div className="rating-item">
                  <span className="rating-label">Đánh giá trung bình:</span>
                  <span className="rating-value">{(reviewStatsData?.data?.averageRating ?? 0).toFixed ? (reviewStatsData?.data?.averageRating ?? 0).toFixed(1) : (reviewStatsData?.data?.averageRating ?? 0)}</span>
                </div>
                <div className="rating-item">
                  <span className="rating-label">Tổng số đánh giá:</span>
                  <span className="rating-value">{reviewStatsData?.data?.reviewCount ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ratings-list real">
            {shopReviewsLoading ? (
              <p>Đang tải đánh giá...</p>
            ) : !shopReviewsData?.data || shopReviewsData.data.length === 0 ? (
              <p>Chưa có đánh giá nào.</p>
            ) : (
              shopReviewsData.data.map((rv) => (
                <div key={rv.id} className="rating-item-row">
                  <div className="rating-left">
                    <StarRating rating={rv.rating} readOnly />
                    <span className="rating-score">{rv.rating?.toFixed ? rv.rating.toFixed(1) : rv.rating}</span>
                  </div>
                  <div className="rating-right">
                    <div className="rating-meta">
                      <span className="reviewer">Khách #{rv.customerId}</span>
                      <span className="date">{new Date(rv.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    {rv.productId && rv.productId > 0 && (
                      <div className="rating-product">{'M\u00f3n:'} {reviewProductMap[rv.productId] || `#${rv.productId}`}</div>
                    )}
                    <div className="rating-content">{rv.content}</div>
                    <ReviewReply reviewId={rv.id} userRole={(user?.role || '').toUpperCase()} onReply={handleReplyToReview} />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="ratings-summary">
            <div className="rating-card">
              <h3>Đánh giá tổng quan</h3>
              <div className="rating-stats">
                <div className="rating-item">
                  <span className="rating-label">Đánh giá trung bình:</span>
                  <span className="rating-value">{(reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0).toFixed ? (reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0).toFixed(1) : (reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0)}</span>
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