import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProductPage() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    if (search) {
      setSearchTerm(search);
      console.log('Tìm kiếm:', search);

      // gọi API tìm kiếm từ Spring Boot
      axios.get(`http://localhost:8080/api/products/search?keyword=${search}`)
        .then((res) => {
          setProducts(res.data);
        })
        .catch((err) => {
          console.error('Lỗi khi gọi API:', err);
        });
    }
  }, [location.search]);

  return (
    <div className="container py-4">
      <h2>Product Page</h2>
      {searchTerm ? (
        <>
          <p>Kết quả tìm kiếm cho: <strong>"{searchTerm}"</strong></p>
          {products.length > 0 ? (
            <ul>
              {products.map((p) => (
                <li key={p.id}>
                  <b>{p.name}</b> - {p.price} VND
                </li>
              ))}
            </ul>
          ) : (
            <p>Không tìm thấy sản phẩm nào.</p>
          )}
        </>
      ) : (
        <p>Danh sách sản phẩm.</p>
      )}
    </div>
  );
}
