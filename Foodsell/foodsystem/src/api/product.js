
import axios from "axios";

const API_BASE = "http://localhost:8080/api/products";

// Lấy tất cả sản phẩm
export const getAllProducts = async () => {
  try {
    const res = await axios.get(API_BASE);
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", err);
    return [];
  }
};

// Tìm kiếm sản phẩm theo keyword
export const searchProducts = async (keyword) => {
  try {
    const res = await axios.get(`${API_BASE}/search?keyword=${keyword}`);
    return res.data;
  } catch (err) {
    console.error("Lỗi khi tìm kiếm sản phẩm:", err);
    return [];
  }
};

// Thêm mới sản phẩm
export const createProduct = async (product) => {
  try {
    const res = await axios.post(API_BASE, product);
    return res.data;
  } catch (err) {
    console.error("Lỗi khi thêm sản phẩm:", err);
    return null;
  }
};
