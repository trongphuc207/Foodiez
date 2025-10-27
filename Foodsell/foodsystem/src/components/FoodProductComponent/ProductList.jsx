
import { useState, useEffect } from "react"
import axios from "axios"
import "./ProductList.css"
import ProductDetail from "./ProductDetail"
// import { useCart } from "../../contexts/CartContext" // Không sử dụng vì chỉ mở ProductDetail modal
import { getShopName } from "../../constants/shopNames"
import { getCategoryName } from "../../constants/categoryNames"

const ProductList = ({ category, products: externalProducts, layout = 'grid' }) => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentLayout] = useState('grid') // Sử dụng grid layout đẹp hơn
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12) // 4 hàng x 3 cột = 12 items
  // const { addToCart: addToCartFunction } = useCart() // Không sử dụng vì chỉ mở ProductDetail modal

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
      console.log("🔄 Fetching products from API...")
      axios.get("http://localhost:8080/api/products")
        .then((res) => {
          console.log("✅ Products fetched:", res.data)
          setProducts(res.data)
          setError(null)
        })
        .catch((err) => {
          console.error("❌ Lỗi khi gọi API:", err)
          setError("Không thể tải danh sách sản phẩm")
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [externalProducts])

  // lọc theo category 
  const filteredProducts = category
    ? products.filter((p) => p.categoryId === category)
    : products

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  // Hàm chuyển trang
  const handlePageChange = (page) => {
    // guard: only change to a valid page
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const handleAddToCart = (product, e) => {
    e.stopPropagation() // Ngăn không cho click vào product card
    
    // Mở ProductDetail modal thay vì thêm trực tiếp vào giỏ hàng
    setSelectedProduct(product)
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

  console.log("🔍 ProductList render:", {
    products: products.length,
    filteredProducts: filteredProducts.length,
    currentProducts: currentProducts.length,
    currentPage,
    totalPages
  })

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <div className="header-content">
          <div className="header-text">
            <h2>
              {category ? getCategoryName(category) : "Tất cả sản phẩm"}
            </h2>
            <p>{filteredProducts.length} sản phẩm (Trang {currentPage}/{totalPages})</p>
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
        {currentProducts.map((product) => (
          <div
            key={product.id}
            className={`product-card ${!product.available ? 'unavailable' : ''}`}
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
              {!product.available && (
                <div className="unavailable-overlay">
                  <span>Không có sẵn</span>
                </div>
              )}
              {product.available && product.status === 'out_of_stock' && (
                <div className="unavailable-overlay">
                  <span>Hết hàng</span>
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
                {product.available && product.status !== 'out_of_stock' && (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            « Trước
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page)}
              className={currentPage === page ? 'active' : ''}
            >
              {page}
            </button>
          ))}
          
          <button 
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau »
          </button>
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
