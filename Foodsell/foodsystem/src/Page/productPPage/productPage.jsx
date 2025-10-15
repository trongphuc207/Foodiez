import { useEffect, useState } from "react";

import { useLocation } from "react-router-dom";
import { productAPI } from "../../api/product";
import ProductList from "../../components/FoodProductComponent/ProductList";
=======
import { getAllProducts } from "../../api/product";


export default function ProductPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Lấy tất cả sản phẩm khi vào trang
    getAllProducts().then(setProducts);
  }, []);

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
      
      {/* Sử dụng ProductList component để hiển thị sản phẩm với đầy đủ chức năng */}
      {products.length > 0 && <ProductList products={products} layout="list" />}
=======
    <div>
      <h2>Danh sách sản phẩm</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            <b>{p.name}</b> - {p.price} VND
          </li>
        ))}
      </ul>

    </div>
  );
}
