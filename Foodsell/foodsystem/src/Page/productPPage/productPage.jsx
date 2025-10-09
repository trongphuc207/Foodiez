import { useEffect, useState } from "react";
import { productAPI } from "../../api/product";

export default function ProductPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Lấy tất cả sản phẩm khi vào trang
    productAPI.getAllProducts().then(setProducts);
  }, []);

  return (
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
