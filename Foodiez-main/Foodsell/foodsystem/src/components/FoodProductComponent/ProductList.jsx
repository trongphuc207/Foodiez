
import { useState, useEffect } from "react"
import axios from "axios"
import "./ProductList.css"
import ProductDetail from "./ProductDetail"
import { useCart } from "../../contexts/CartContext"
import { getShopName } from "../../constants/shopNames"
import { getCategoryName } from "../../constants/categoryNames"

const ProductList = ({ category, products: externalProducts, layout = 'grid' }) => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentLayout] = useState('grid') // Sử dụng grid layout đẹp hơn
  const { addToCart } = useCart()

  // gọi API lấy sản phẩm hoặc sử dụng products từ props
  useEffect(() => {
    if (externalProducts) {
      // Sử dụng products từ props (cho search results)
      setProducts(externalProducts)
      setLoading(false)
      setError(null)
    } else {
      // Fetch từ API (cho HomePage)
      setLoading(true)
      axios.get("http://localhost:8080/api/products")
        .then((res) => {
          // Handle the API response format: { success: true, data: [...] }
          const productsData = res.data.data || res.data;
          setProducts(Array.isArray(productsData) ? productsData : [])
          setError(null)
        })
        .catch((err) => {
          console.error("Lỗi khi gọi API:", err)
          setError("Không thể tải danh sách sản phẩm")
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [externalProducts])

  // lọc theo category 
  const filteredProducts = category
    ? (Array.isArray(products) ? products.filter((p) => p.categoryId === category) : [])
    : (Array.isArray(products) ? products : [])

  const handleAddToCart = (product, e) => {
    e.stopPropagation() // Ngăn không cho click vào product card
    
    // Thêm sản phẩm vào giỏ hàng
    addToCart(product)
    alert(`Đã thêm ${product.name} vào giỏ hàng!`)
  }

  const handleProductImageClick = (product, e) => {
    e.stopPropagation() // Ngăn không cho click vào product card
    
    // Mở ProductDetail modal để xem chi tiết sản phẩm
    setSelectedProduct(product)
  }

  if (loading) {
    return (
      <div className="product-list-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="product-list-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <div className="header-content">
          <div className="header-text">
            <h2>
              {category ? getCategoryName(category) : "Tất cả sản phẩm"}
            </h2>
            <p>{filteredProducts.length} sản phẩm</p>
          </div>
          <div className="layout-toggle">
            <button 
              className={`toggle-btn ${currentLayout === 'grid' ? 'active' : ''}`}
              title="Hiển thị dạng lưới"
            >
              ⊞
            </button>
          </div>
        </div>
      </div>

      <div className={currentLayout === 'grid' ? 'products-grid' : 'products-list'}>
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`product-card ${!product.available || product.status !== 'active' ? 'unavailable' : ''}`}
          >
            {/* Ảnh sản phẩm */}
            <div 
              className="product-image"
              onClick={(e) => handleProductImageClick(product, e)}
            >
              {product.imageUrl || product.image_url || product.image ? (
                <img
                  src={product.imageUrl || product.image_url || product.image} 
                  alt={product.name}
                  onError={(e) => {
                    console.log('❌ Image load error for product:', product.name, 'URL:', e.target.src);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  onLoad={() => {
                    console.log('✅ Image loaded successfully for product:', product.name);
                  }}
                />
              ) : null}
              
              {/* Placeholder khi không có ảnh hoặc ảnh lỗi */}
              <div 
                className="product-placeholder"
                style={{ display: product.imageUrl || product.image_url || product.image ? 'none' : 'flex' }}
              >
                <div className="placeholder-content">
                  <div className="placeholder-icon">🍽️</div>
                  <span className="placeholder-text">Không có ảnh</span>
                </div>
              </div>
              {(!product.available || product.status !== 'active') && (
                <div className="unavailable-overlay">
                  <span>
                    {product.status === 'out_of_stock' ? 'Hết hàng' : 'Tạm ngừng'}
                  </span>
                </div>
              )}
            </div>

            {/* Thông tin sản phẩm */}
            <div className="product-info">
              <div className="product-content">
                <h3 className="product-name">{product.name}</h3>
                <p className="shop-name">🏪 {getShopName(product.shopId)}</p>
                <p className="product-description">{product.description}</p>
                <div className="product-stats">
                  <span className="category">{getCategoryName(product.categoryId)}</span>
                  <span className={`status ${product.status}`}>
                    {product.status === 'active' ? '✅ Còn hàng' : 
                     product.status === 'inactive' ? '⏸️ Tạm ngừng' : 
                     product.status === 'out_of_stock' ? '❌ Hết hàng' : product.status}
                  </span>
                </div>
              </div>

              {/* Giá và nút thêm vào giỏ hàng */}
              <div className="product-actions">
                <div className="product-price">
                  <span className="current-price">{product.price.toLocaleString()}đ</span>
                </div>
                
                {/* Nút Add to Cart với icon đẹp hơn */}
                {product.available && product.status === 'active' && (
                  <button 
                    className="add-to-cart-btn"
                    onClick={(e) => handleAddToCart(product, e)}
                  >
                    🛒 Thêm vào giỏ hàng
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-products">
          <p>Không có sản phẩm nào</p>
        </div>
      )}

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}

export default ProductList
