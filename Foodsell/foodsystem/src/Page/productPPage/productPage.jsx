import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { productAPI } from "../../api/product";
import ProductList from "../../components/FoodProductComponent/ProductList";

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
      
      {/* Sử dụng ProductList component để hiển thị sản phẩm với đầy đủ chức năng */}
      {products.length > 0 && <ProductList products={products} layout="list" />}
    </div>
  );
}
