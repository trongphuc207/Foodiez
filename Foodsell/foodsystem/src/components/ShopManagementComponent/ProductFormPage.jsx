import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { productAPI } from '../../api/product';
import { shopAPI } from '../../api/shop';
import { categoryNames } from '../../constants/categoryNames';
import ImageUpload from '../AdminComponent/ImageUpload';
import './ProductFormPage.css';

const ProductFormPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditMode = !!productId && productId !== 'new';

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

  // Fetch shop data
  const { data: shopData, isLoading: shopLoading } = useQuery({
    queryKey: ['shop', user?.id],
    queryFn: () => shopAPI.getShopBySellerId(user?.id),
    enabled: !!user?.id
  });

  // Fetch product data if editing
  const { data: productData, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => {
      const id = parseInt(productId);
      if (isNaN(id)) {
        throw new Error('Invalid product ID');
      }
      return productAPI.getProductById(id);
    },
    enabled: isEditMode && !!productId && productId !== 'new'
  });

  // Tạo danh mục từ constants
  const getCategories = () => {
    return {
      success: true,
      data: Object.entries(categoryNames).map(([id, name]) => ({
        id: parseInt(id),
        name: name
      })),
      message: "Danh mục từ constants"
    };
  };

  // Sử dụng categories từ constants (không fetch từ database)
  const categoriesData = useMemo(() => getCategories(), []);
  const categoriesLoading = false;

  // Load product data into form when editing
  useEffect(() => {
    if (isEditMode && productData) {
      console.log('📦 Loading product data into form:', productData);
      
      // Handle different response structures
      let product = null;
      if (productData.data) {
        product = productData.data;
      } else if (productData.id) {
        product = productData;
      }
      
      if (product) {
        console.log('✅ Product found:', product);
        console.log('📋 Product fields:', {
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId,
          is_available: product.is_available,
          status: product.status
        });
        
        setProductForm({
          name: product.name || '',
          description: product.description || '',
          price: (product.price || 0).toString(),
          categoryId: product.categoryId ? product.categoryId.toString() : '',
          image: null,
          is_available: product.is_available !== undefined ? product.is_available : (product.available !== undefined ? product.available : true),
          status: product.status || 'active'
        });
        setProductImageUrl(product.imageUrl || product.image_url || product.image);
      } else {
        console.warn('⚠️ Product data structure not recognized:', productData);
      }
    }
  }, [isEditMode, productData]);

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: productAPI.createProduct,
    onSuccess: (result) => {
      console.log('✅ Product created successfully:', result);
      queryClient.invalidateQueries(['products']);
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
          
          if (attempt > 1) {
            const delay = Math.pow(2, attempt - 2) * 1000;
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          if (attempt === 1) {
            return await productAPI.updateProduct(id, data);
          } else {
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
          
          if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
            console.log('🔄 Network error detected, will retry...');
            continue;
          }
          
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
      
      throw lastError;
    },
    onSuccess: (result) => {
      console.log('✅ Product updated successfully:', result);
      queryClient.invalidateQueries(['products']);
    },
    onError: (error) => {
      console.error('❌ Update product error:', error);
      
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

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Form submitted with values:', {
      name: productForm.name,
      price: productForm.price,
      categoryId: productForm.categoryId,
      description: productForm.description
    });
    
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

    console.log('✅ Product data after validation:', productData);

    if (!productData.name || !productData.price || !productData.categoryId || !productData.shopId) {
      alert('❌ Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường bắt buộc.');
      console.error('❌ Missing required fields:', {
        name: productData.name,
        price: productData.price,
        categoryId: productData.categoryId,
        shopId: productData.shopId
      });
      return;
    }

    console.log('📤 Sending product data:', productData);

    // Upload image after product creation/update if image is provided
    const uploadImageIfNeeded = async (productId) => {
      if (productForm.image && productId) {
        console.log('📤 Uploading image for product:', productId);
        setIsUploadingImage(true);
        try {
          const uploadResult = await productAPI.uploadProductImage(productId, productForm.image);
          console.log('✅ Image uploaded successfully:', uploadResult);
          queryClient.invalidateQueries(['products']);
        } catch (imageError) {
          console.error('❌ Image upload failed:', imageError);
          alert('⚠️ Sản phẩm đã được ' + (isEditMode ? 'cập nhật' : 'tạo') + ' nhưng không thể tải ảnh lên. Vui lòng thử lại sau.');
        } finally {
          setIsUploadingImage(false);
        }
      }
    };

    // Use mutations to handle create/update
    if (isEditMode) {
      // Update existing product
      const productIdNum = parseInt(productId);
      updateProductMutation.mutate(
        { id: productIdNum, data: productData },
        {
          onSuccess: async (result) => {
            await uploadImageIfNeeded(productIdNum);
            alert('✅ Cập nhật món ăn thành công!');
            navigate('/shop-management');
          }
        }
      );
    } else {
      // Create new product
      createProductMutation.mutate(productData, {
        onSuccess: async (result) => {
          const newProductId = result?.data?.id;
          await uploadImageIfNeeded(newProductId);
          alert('✅ Thêm món ăn thành công!');
          navigate('/shop-management');
        }
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('❌ Kích thước file quá lớn. Tối đa 5MB.');
        e.target.value = '';
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('❌ Định dạng file không hợp lệ. Chỉ chấp nhận JPEG, PNG, GIF, WebP.');
        e.target.value = '';
        return;
      }
      
      console.log('📁 Selected file:', file.name, 'Size:', file.size, 'Type:', file.type);
    }
    
    setProductForm({ ...productForm, image: file });
  };

  const handleCancel = () => {
    navigate('/shop-management');
  };

  if (shopLoading || (isEditMode && productLoading)) {
    return <div className="product-form-page-loading">Đang tải...</div>;
  }

  if (!shopData?.data) {
    return (
      <div className="product-form-page">
        <div className="product-form-container">
          <div className="no-shop-message">
            <h2>Bạn chưa có cửa hàng</h2>
            <p>Vui lòng đăng ký cửa hàng trước khi sử dụng chức năng quản lý.</p>
            <button onClick={() => navigate('/shop-management')} className="btn btn-primary">
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error if product loading failed
  if (isEditMode && productError) {
    console.error('❌ Error loading product:', productError);
    return (
      <div className="product-form-page">
        <div className="product-form-container">
          <div className="error-message" style={{ padding: '20px', margin: '20px 0' }}>
            <h3>❌ Lỗi khi tải thông tin sản phẩm</h3>
            <p>{productError.message || 'Không thể tải thông tin sản phẩm. Vui lòng thử lại.'}</p>
            <button onClick={() => navigate('/shop-management')} className="btn btn-primary" style={{ marginTop: '10px' }}>
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-form-page">
      <div className="product-form-container">
        <div className="product-form-header">
          <h2>{isEditMode ? 'Sửa món ăn' : 'Thêm món ăn mới'}</h2>
          <button onClick={handleCancel} className="btn-close">
            ✕
          </button>
        </div>

        <form onSubmit={handleProductSubmit} className="product-form">
          <div className="form-group">
            <label>Tên món ăn: <span className="required">*</span></label>
            <input
              type="text"
              placeholder="Nhập tên món ăn"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Mô tả:</label>
            <textarea
              placeholder="Nhập mô tả món ăn"
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Giá (VNĐ): <span className="required">*</span></label>
            <input
              type="number"
              placeholder="Nhập giá món ăn"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              min="0"
              step="1000"
              required
            />
          </div>

          <div className="form-group">
            <label>Danh mục: <span className="required">*</span></label>
            <select
              value={productForm.categoryId}
              onChange={(e) => {
                console.log('Selected category ID:', e.target.value);
                setProductForm({ ...productForm, categoryId: e.target.value });
              }}
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
          </div>

          <div className="form-group">
            <label>Ảnh món ăn:</label>
            {isEditMode ? (
              <ImageUpload
                productId={productId}
                currentImageUrl={productImageUrl}
                onImageUpdate={(newImageUrl) => {
                  setProductImageUrl(newImageUrl);
                  queryClient.invalidateQueries(['products']);
                }}
              />
            ) : (
              <div className="image-upload-section">
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
                {isUploadingImage && (
                  <div className="upload-status">
                    <p>⏳ Đang upload ảnh...</p>
                  </div>
                )}
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
              <option value="out_of_stock">🚫 Hết nguyên liệu</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn btn-cancel">
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={createProductMutation.isPending || updateProductMutation.isPending}
              className="btn btn-submit"
            >
              {createProductMutation.isPending || updateProductMutation.isPending ? 
                '⏳ Đang xử lý...' : 
                (isEditMode ? 'Cập nhật' : 'Thêm món')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormPage;

