import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { productAPI, testServerConnection } from '../../api/product';
import { shopAPI } from '../../api/shop';
import categoryAPI from '../../api/category';
import './ShopManagement.css';

const ShopManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('products');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showShopForm, setShowShopForm] = useState(false);
  const [showRatings, setShowRatings] = useState(false);

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

  const [shopForm, setShopForm] = useState({
    name: '',
    description: '',
    address: '',
    opening_hours: ''
  });

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

  // Fetch categories with fallback data
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        return await categoryAPI.getAllCategories();
      } catch (error) {
        console.error('❌ Categories API error:', error);
        // Return fallback data if API fails
        return {
          success: true,
          data: [
            { id: 1, name: 'Phở', description: 'Vietnamese noodle soup' },
            { id: 2, name: 'Bánh Mì', description: 'Vietnamese sandwich' },
            { id: 3, name: 'Cơm', description: 'Rice dishes' },
            { id: 4, name: 'Nước uống', description: 'Beverages' },
            { id: 5, name: 'Pizza', description: 'Italian pizza' },
            { id: 6, name: 'Bún', description: 'Vietnamese vermicelli' }
          ]
        };
      }
    },
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Debug log for categories
  useEffect(() => {
    if (categoriesData) {
      console.log('📂 Categories loaded:', categoriesData);
    }
    if (categoriesError) {
      console.error('❌ Categories error:', categoriesError);
    }
  }, [categoriesData, categoriesError]);

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
      setProductForm({ name: '', description: '', price: '', categoryId: '', image: null, is_available: true, status: 'active' });
      alert('✅ Thêm món ăn thành công!');
    },
    onError: (error) => {
      console.error('❌ Create product error:', error);
      alert('❌ Lỗi khi thêm món ăn: ' + error.message);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const maxRetries = 5;
      let lastError = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Attempt ${attempt}/${maxRetries} for product ${id}`);
          
          // Add delay between attempts
          if (attempt > 1) {
            const delay = Math.pow(2, attempt - 2) * 1000; // 1s, 2s, 4s, 8s
            console.log(`⏳ Waiting ${delay}ms before retry...`);
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
            
            console.log(`🔄 Attempt ${attempt} with minimal data:`, minimalData);
            return await productAPI.updateProduct(id, minimalData);
          }
        } catch (error) {
          lastError = error;
          console.error(`❌ Attempt ${attempt} failed:`, error);
          
          // If it's a network error, continue to retry
          if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
            console.log('🔄 Network error detected, will retry...');
            continue;
          }
          
          // If it's a server error, try with even more minimal data
          if (error.message.includes('500') || error.message.includes('Internal server error')) {
            console.log('🔄 Server error detected, trying with ultra-minimal data...');
            try {
              const ultraMinimalData = {
                name: data.name,
                price: data.price,
                categoryId: data.categoryId,
                shopId: data.shopId
              };
              return await productAPI.updateProduct(id, ultraMinimalData);
            } catch (ultraMinimalError) {
              console.error('❌ Ultra-minimal data attempt also failed:', ultraMinimalError);
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
      alert('✅ Cập nhật món ăn thành công!');
    },
    onError: (error) => {
      console.error('❌ Update product error:', error);
      
      // Check if it's a server connection issue
      if (error.message.includes('Network error') || error.message.includes('Failed to fetch') || error.message.includes('Cannot connect to server')) {
        alert('❌ Không thể kết nối đến server!\n\nVui lòng kiểm tra:\n1. Server có đang chạy không? (Port 8080)\n2. Kết nối internet\n3. Thử refresh trang\n4. Kiểm tra console để xem chi tiết lỗi');
      } else if (error.message.includes('500') || error.message.includes('Internal server error')) {
        alert('❌ Lỗi server!\n\nVui lòng thử lại sau hoặc liên hệ admin.');
      } else if (error.message.includes('Server not responding properly')) {
        alert('❌ Server không phản hồi đúng cách!\n\nVui lòng kiểm tra server có đang chạy không.');
      } else {
        alert('❌ Lỗi khi cập nhật món ăn: ' + error.message + '\n\nVui lòng thử lại hoặc liên hệ admin.');
      }
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: productAPI.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
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

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!productForm.name.trim()) {
      alert('❌ Vui lòng nhập tên món ăn');
      return;
    }
    if (!productForm.price || parseFloat(productForm.price) <= 0) {
      alert('❌ Vui lòng nhập giá hợp lệ');
      return;
    }
    if (!productForm.categoryId) {
      alert('❌ Vui lòng chọn danh mục');
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
      alert('❌ Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường bắt buộc.');
      return;
    }

    console.log('📤 Sending product data:', productData);

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
        console.log('📤 Uploading image for product:', productResult.data.id);
        try {
          await productAPI.uploadProductImage(productResult.data.id, productForm.image);
          console.log('✅ Image uploaded successfully');
        } catch (imageError) {
          console.error('❌ Image upload failed:', imageError);
          alert('⚠️ Sản phẩm đã được tạo/cập nhật nhưng không thể tải ảnh lên. Vui lòng thử lại sau.');
        }
      }
      
      // Success
      queryClient.invalidateQueries(['products']);
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', categoryId: '', image: null, is_available: true, status: 'active' });
      alert('✅ ' + (editingProduct ? 'Cập nhật' : 'Thêm') + ' món ăn thành công!');
      
    } catch (error) {
      console.error('❌ Product operation failed:', error);
      alert('❌ Lỗi khi ' + (editingProduct ? 'cập nhật' : 'thêm') + ' món ăn: ' + error.message);
    }
  };

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

  const handleEditProduct = async (product) => {
    console.log('🔍 Editing product:', product);
    console.log('📦 Product status:', product.status);
    console.log('📦 Product is_available:', product.is_available);
    
    try {
      // Fetch detailed product info from database
      const detailedProduct = await productAPI.getProductById(product.id);
      console.log('📦 Detailed product from API:', detailedProduct);
      
      const productData = detailedProduct.data || detailedProduct;
      
      // Get status value (priority: API data > product data > default)
      let statusValue = 'active';
      if (productData.status) {
        statusValue = productData.status;
      } else if (product.status) {
        statusValue = product.status;
      }
      
      console.log('📦 Final status value:', statusValue);
      
      setEditingProduct(productData);
      setProductForm({
        name: productData.name || product.name,
        description: productData.description || product.description,
        price: (productData.price || product.price).toString(),
        categoryId: productData.categoryId || product.categoryId,
        image: null,
        is_available: productData.is_available !== undefined ? productData.is_available : product.available,
        status: statusValue
      });
      setShowProductForm(true);
    } catch (error) {
      console.error('❌ Error fetching product details:', error);
      // Fallback to original product data
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        categoryId: product.categoryId,
        image: null,
        status: product.status || 'active'
      });
      setShowProductForm(true);
    }
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
        alert('❌ Kích thước file quá lớn. Tối đa 5MB.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('❌ Định dạng file không hợp lệ. Chỉ chấp nhận JPEG, PNG, GIF, WebP.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      console.log('📁 Selected file:', file.name, 'Size:', file.size, 'Type:', file.type);
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
              onClick={() => {
                setEditingProduct(null);
                setProductForm({ name: '', description: '', price: '', categoryId: '', image: null });
                setShowProductForm(true);
              }}
            >
              ➕ Thêm món ăn
            </button>
          </div>

          {showProductForm && (
            <div className="modal-overlay" onClick={() => setShowProductForm(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{editingProduct ? 'Sửa món ăn' : 'Thêm món ăn mới'}</h3>
                <form onSubmit={handleProductSubmit}>
                  <div className="form-group">
                    <label>Tên món ăn:</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mô tả:</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Giá (VNĐ):</label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                    />
                  </div>
                   <div className="form-group">
                     <label>Danh mục:</label>
                     <select
                       value={productForm.categoryId}
                       onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                       required
                       disabled={categoriesLoading}
                     >
                       <option value="">
                         {categoriesLoading ? 'Đang tải danh mục...' : 'Chọn danh mục'}
                       </option>
                       {categoriesData?.data?.map(category => (
                         <option key={category.id} value={category.id}>
                           {category.name}
                         </option>
                       ))}
                     </select>
                     {categoriesError && (
                       <div className="error-message">
                         ⚠️ Lỗi khi tải danh mục từ server. Đang sử dụng danh mục mặc định.
                       </div>
                     )}
                   </div>
                  <div className="form-group">
                    <label>Ảnh món ăn:</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageChange}
                    />
                    {productForm.image && (
                      <div className="file-info">
                        <p>📁 File đã chọn: {productForm.image.name}</p>
                        <p>📏 Kích thước: {(productForm.image.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Tình trạng sẵn có:</label>
                    <select
                      value={productForm.is_available}
                      onChange={(e) => setProductForm({ ...productForm, is_available: e.target.value === 'true' })}
                    >
                      <option value={true}>✅ Có sẵn</option>
                      <option value={false}>❌ Không có sẵn</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Trạng thái bán hàng:</label>
                    <select
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                    >
                      <option value="active">✅ Đang bán</option>
                      <option value="inactive">⏸️ Tạm ngừng bán</option>
                      <option value="out_of_stock">❌ Hết hàng</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowProductForm(false)}>
                      Hủy
                    </button>
                    <button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                      {createProductMutation.isPending || updateProductMutation.isPending ? 
                        '⏳ Đang xử lý...' : 
                        (editingProduct ? 'Cập nhật' : 'Thêm món')
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

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
                         product.status === 'out_of_stock' ? '❌ Hết hàng' : '❌ Không xác định'}
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
