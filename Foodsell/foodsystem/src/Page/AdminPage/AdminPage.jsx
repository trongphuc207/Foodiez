import React, { useState, useEffect } from 'react';
import { productAPI } from '../../api/product';
import ImageUpload from '../../components/AdminComponent/ImageUpload';
import './AdminPage.css';

const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load danh sách sản phẩm
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await productAPI.getAllProducts();
      setProducts(productsData);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = (productId, newImageUrl) => {
    // Cập nhật ảnh trong danh sách sản phẩm
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, imageUrl: newImageUrl }
          : product
      )
    );
    
    // Reset selected product nếu đang chọn sản phẩm này
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(prev => ({ ...prev, imageUrl: newImageUrl }));
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="error">
          <p>{error}</p>
          <button onClick={loadProducts}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>📤 Upload ảnh sản phẩm</h1>
        <p>Chọn sản phẩm và upload ảnh dễ dàng</p>
      </div>

      <div className="admin-content">
        {/* Danh sách sản phẩm */}
        <div className="products-section">
          <h2>📦 Danh sách sản phẩm ({products.length})</h2>
          <div className="products-grid">
            {products.map(product => (
              <div 
                key={product.id} 
                className={`product-card ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="product-image">
                  <img 
                    src={product.imageUrl || "/placeholder.svg"} 
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = "/placeholder.svg";
                    }}
                  />
                  {!product.imageUrl && (
                    <div className="no-image-badge">📷 Chưa có ảnh</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-price">{product.price.toLocaleString()}đ</p>
                  <p className="product-shop">Shop: {product.shopId}</p>
                  <p className="product-category">Danh mục: {product.categoryId}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload ảnh cho sản phẩm được chọn */}
        {selectedProduct && (
          <div className="upload-section">
            <h2>📤 Upload ảnh cho: {selectedProduct.name}</h2>
            <ImageUpload 
              productId={selectedProduct.id}
              currentImageUrl={selectedProduct.imageUrl}
              onImageUpdate={(newImageUrl) => handleImageUpdate(selectedProduct.id, newImageUrl)}
            />
          </div>
        )}

        {/* Hướng dẫn sử dụng */}
        <div className="instructions-section">
          <h2>📋 Hướng dẫn sử dụng</h2>
          <div className="instructions">
            <div className="instruction-step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h3>Chọn sản phẩm</h3>
                <p>Click vào sản phẩm trong danh sách bên trái để chọn</p>
              </div>
            </div>
            
            <div className="instruction-step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h3>Upload ảnh</h3>
                <p>Chọn file ảnh từ máy tính (JPG, PNG, GIF - tối đa 10MB)</p>
              </div>
            </div>
            
            <div className="instruction-step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h3>Xem trước và upload</h3>
                <p>Xem trước ảnh và click "Upload ảnh" để lưu</p>
              </div>
            </div>
            
            <div className="instruction-step">
              <span className="step-number">4</span>
              <div className="step-content">
                <h3>Quản lý ảnh</h3>
                <p>Có thể xóa ảnh cũ hoặc upload ảnh mới bất kỳ lúc nào</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
