const API_BASE_URL = 'http://localhost:8080/api';

export const productAPI = {
  // Lấy tất cả sản phẩm
  getAllProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return response.json();
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (keyword) => {
    const response = await fetch(`${API_BASE_URL}/products/search?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      throw new Error('Failed to search products');
    }
    return response.json();
  },

  // Lấy sản phẩm theo shop ID
  getProductsByShopId: async (shopId) => {
    const response = await fetch(`${API_BASE_URL}/products/shop/${shopId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch products by shop');
    }
    return response.json();
  },

  // Tạo sản phẩm mới
  createProduct: async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    return response.json();
  },

  // Upload ảnh cho sản phẩm
  uploadProductImage: async (productId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/products/${productId}/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload product image');
    }
    return response.json();
  },

  // Xóa ảnh sản phẩm
  removeProductImage: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/remove-image`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove product image');
    }
    return response.json();
  },

  // Cập nhật sản phẩm
  updateProduct: async (productId, productData) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    return response.json();
  },

  // Xóa sản phẩm
  deleteProduct: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
    return response.ok;
  }
};