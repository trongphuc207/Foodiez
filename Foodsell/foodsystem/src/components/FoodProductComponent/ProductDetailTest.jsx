import React, { useState } from 'react';
import ProductDetail from './ProductDetail';

const ProductDetailTest = () => {
  const [showModal, setShowModal] = useState(false);
  
  const testProduct = {
    id: 1,
    name: "Mì Quảng Tôm Thịt",
    description: "Mi Quang dac san Da Nang voi tom, thit va rau song. (Traditional Da Nang Quang noodles with shrimp, meat and fresh vegetables)",
    price: 4,
    imageUrl: "http://localhost:8080/uploads/product-images/placeholder.jpg",
    shopId: 1,
    categoryId: 1,
    status: 'active',
    available: true,
    createdAt: new Date('2025-09-10')
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test ProductDetail Modal</h2>
      <button 
        onClick={() => setShowModal(true)}
        style={{
          padding: '10px 20px',
          backgroundColor: '#ff6b35',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Mở ProductDetail Modal
      </button>
      
      {showModal && (
        <ProductDetail
          product={testProduct}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ProductDetailTest;
