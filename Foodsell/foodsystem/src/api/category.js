import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_ORDER_URL ? `${process.env.REACT_APP_ORDER_URL}/api/categories` : 'http://localhost:8080/api/categories';

// Tạo axios instance với config mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để xử lý response
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Category API Error:', error);
    return Promise.reject(error);
  }
);

// API functions
const categoryAPI = {
  // Lấy tất cả categories
  getAllCategories: async () => {
    try {
      const response = await apiClient.get('/');
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách categories: ${error.message}`);
    }
  },

  // Lấy category theo ID
  getCategoryById: async (id) => {
    try {
      const response = await apiClient.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi lấy category: ${error.message}`);
    }
  },

  // Lấy category theo tên
  getCategoryByName: async (name) => {
    try {
      const response = await apiClient.get(`/name/${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi lấy category theo tên: ${error.message}`);
    }
  },

  // Tạo category mới
  createCategory: async (categoryData) => {
    try {
      const response = await apiClient.post('/', categoryData);
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi tạo category: ${error.message}`);
    }
  },

  // Cập nhật category
  updateCategory: async (id, categoryData) => {
    try {
      const response = await apiClient.put(`/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi cập nhật category: ${error.message}`);
    }
  },

  // Xóa category
  deleteCategory: async (id) => {
    try {
      const response = await apiClient.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi xóa category: ${error.message}`);
    }
  },

  // Tìm kiếm categories
  searchCategories: async (keyword) => {
    try {
      const response = await apiClient.get(`/search?keyword=${encodeURIComponent(keyword)}`);
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi tìm kiếm categories: ${error.message}`);
    }
  },

  // Tìm kiếm categories theo tên
  searchCategoriesByName: async (name) => {
    try {
      const response = await apiClient.get(`/search/name?name=${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi tìm kiếm categories theo tên: ${error.message}`);
    }
  },

  // Tìm kiếm categories theo description
  searchCategoriesByDescription: async (description) => {
    try {
      const response = await apiClient.get(`/search/description?description=${encodeURIComponent(description)}`);
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi tìm kiếm categories theo description: ${error.message}`);
    }
  },

  // Kiểm tra category có tồn tại không
  categoryExists: async (id) => {
    try {
      const response = await apiClient.get(`/exists/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi kiểm tra category: ${error.message}`);
    }
  },

  // Kiểm tra tên category có tồn tại không
  categoryNameExists: async (name) => {
    try {
      const response = await apiClient.get(`/exists/name/${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi kiểm tra tên category: ${error.message}`);
    }
  },

  // Đếm số lượng categories
  getCategoryCount: async () => {
    try {
      const response = await apiClient.get('/count');
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi đếm categories: ${error.message}`);
    }
  },

  // Lấy categories mới nhất
  getLatestCategories: async () => {
    try {
      const response = await apiClient.get('/latest');
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi lấy categories mới nhất: ${error.message}`);
    }
  },

  // Tạo dữ liệu mẫu
  seedData: async () => {
    try {
      const response = await apiClient.get('/seed');
      return response.data;
    } catch (error) {
      throw new Error(`Lỗi khi tạo dữ liệu mẫu: ${error.message}`);
    }
  }
};

export default categoryAPI;
