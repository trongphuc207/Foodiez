"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import "./ProductList.css"
import ProductDetail from "./ProductDetail"

const ProductList = ({ category }) => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  // gọi API lấy sản phẩm
  useEffect(() => {
    axios.get("http://localhost:8080/api/products")
      .then((res) => {
        setProducts(res.data)
      })
      .catch((err) => {
        console.error("Lỗi khi gọi API:", err)
      })
  }, [])

  // lọc theo category 
  const filteredProducts = category
    ? products.filter((p) => p.category === category)
    : products

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
            className="product-card"
            onClick={() => setSelectedProduct(product)}
          >
            <div className="product-image">
              <img
                src={`/images/${product.imageUrl}`} 
                alt={product.name}
              />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="shop-name">Shop: {product.shopId}</p>
              <div className="product-stats">
                <span className="rating">⭐ {product.rating || 4.5}</span>
                <span className="sold">Đã bán {product.sold || 100}</span>
              </div>
              <div className="product-price">
                <span className="current-price">{product.price} $</span>
              </div>
            </div>
          </div>
        ))}
      </div>

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
