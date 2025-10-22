import { useEffect, useState } from "react";

import { useLocation } from "react-router-dom";
import { getAllProducts, searchProducts } from "../../api/product";
import ProductList from "../../components/FoodProductComponent/ProductList";


export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const searchKeyword = new URLSearchParams(location.search).get('search');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (searchKeyword) {
          // Tìm kiếm sản phẩm theo keyword
          const searchResults = await searchProducts(searchKeyword);
          setProducts(searchResults);
        } else {
          // Lấy tất cả sản phẩm
          const allProducts = await getAllProducts();
          setProducts(allProducts);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      }
    };

    loadProducts();
  }, [searchKeyword]);

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
    </div>
  );
}
