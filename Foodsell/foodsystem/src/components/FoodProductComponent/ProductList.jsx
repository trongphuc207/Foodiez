
import { useState, useEffect } from "react"
import axios from "axios"
import "./ProductList.css"
import ProductDetail from "./ProductDetail"
import { useCart } from "../../contexts/CartContext"
import { getShopName } from "../../constants/shopNames"
import { getCategoryName } from "../../constants/categoryNames"

const ProductList = ({ category }) => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { addToCart } = useCart()

  // gọi API lấy sản phẩm
  useEffect(() => {
    setLoading(true)
    axios.get("http://localhost:8080/api/products")
      .then((res) => {
        setProducts(res.data)
        setError(null)
      })
      .catch((err) => {
        console.error("Lỗi khi gọi API:", err)
        setError("Không thể tải danh sách sản phẩm")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // lọc theo category 
  const filteredProducts = category
    ? products.filter((p) => p.categoryId === category)
    : products

  const handleAddToCart = (product, e) => {
    e.stopPropagation() // Ngăn không cho click vào product card
    
    // Mở ProductDetail modal để chọn số lượng và add vào giỏ
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
        <h2>{category || "Tất cả sản phẩm"}</h2>
        <p>{filteredProducts.length} sản phẩm</p>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`product-card ${!product.available || product.status !== 'active' ? 'unavailable' : ''}`}
          >
            <div 
              className="product-image"
              onClick={(e) => handleProductImageClick(product, e)}
            >
              <img
                src={product.imageUrl ? `/images/${product.imageUrl}` : "/placeholder.svg"} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = "/placeholder.svg"
                }}
              />
              {(!product.available || product.status !== 'active') && (
                <div className="unavailable-overlay">
                  <span>
                    {product.status === 'out_of_stock' ? 'Hết hàng' : 'Tạm ngừng'}
                  </span>
                </div>
              )}
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="shop-name">{getShopName(product.shopId)}</p>
              <p className="product-description">{product.description}</p>
              <div className="product-stats">
                <span className="category">Danh mục: {getCategoryName(product.categoryId)}</span>
                <span className="status">
                  {product.status === 'active' ? '✅ Còn hàng' : 
                   product.status === 'inactive' ? '⏸️ Tạm ngừng' : 
                   product.status === 'out_of_stock' ? '❌ Hết hàng' : product.status}
                </span>
              </div>
              <div className="product-price">
                <span className="current-price">{product.price.toLocaleString()}đ</span>
              </div>
              
              {/* Nút Add to Cart màu đỏ */}
              {product.available && product.status === 'active' && (
                <button 
                  className="add-to-cart-btn"
                  onClick={(e) => handleAddToCart(product, e)}
                >
                  🛒 Thêm vào giỏ
                </button>
              )}
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
