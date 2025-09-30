import "./ProductDetail.css"

const ProductDetail = ({ product, onClose }) => {
  if (!product) return null

  return (
    <div className="product-detail-overlay" onClick={onClose}>
      <div className="product-detail-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <img src={`/images/${product.imageUrl}`} alt={product.name} className="detail-img" />
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p><strong>{product.price} $</strong></p>
        <small>🛍️ Shop: {product.shopId}</small><br />
        <small>📅 {new Date(product.createdAt).toLocaleDateString()}</small>
      </div>
    </div>
  )
}

export default ProductDetail
