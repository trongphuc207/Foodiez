import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { productAPI } from "../../api/product";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const search = searchParams.get('search');
    
    setLoading(true);
    
    if (search && search.trim()) {
      // Tìm kiếm sản phẩm theo từ khóa
      setSearchKeyword(search);
      productAPI.searchProducts(search.trim())
        .then((searchResults) => {
          setProducts(searchResults);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Lỗi tìm kiếm:', error);
          setProducts([]);
          setLoading(false);
        });
    } else {
      // Lấy tất cả sản phẩm khi không có tìm kiếm
      setSearchKeyword("");
      productAPI.getAllProducts()
        .then((allProducts) => {
          setProducts(allProducts);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Lỗi tải sản phẩm:', error);
          setProducts([]);
          setLoading(false);
        });
    }
  }, [location.search]);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Đang tải...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {searchKeyword ? (
        <div>
          <h2>Kết quả tìm kiếm cho: "{searchKeyword}"</h2>
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Không tìm thấy sản phẩm nào với từ khóa "{searchKeyword}"</p>
              <p>Hãy thử tìm kiếm với từ khóa khác.</p>
            </div>
          ) : (
            <p>Tìm thấy {products.length} sản phẩm</p>
          )}
        </div>
      ) : (
        <h2>Danh sách tất cả sản phẩm</h2>
      )}
      
      {products.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {products.map((p) => (
            <li key={p.id} style={{ 
              border: '1px solid #ddd', 
              margin: '10px 0', 
              padding: '15px', 
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {p.imageUrl && (
                  <img 
                    src={p.imageUrl} 
                    alt={p.name}
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                )}
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{p.name}</h3>
                  <p style={{ margin: '0 0 5px 0', color: '#666' }}>{p.description}</p>
                  <p style={{ margin: '0', fontWeight: 'bold', color: '#ff6b35', fontSize: '18px' }}>
                    {p.price.toLocaleString('vi-VN')} VND
                  </p>
                  <span style={{ 
                    padding: '4px 8px', 
                    backgroundColor: p.available ? '#4CAF50' : '#f44336',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {p.available ? 'Có sẵn' : 'Hết hàng'}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
