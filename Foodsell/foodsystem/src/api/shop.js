const API_BASE_URL = 'http://localhost:8080/api';

export const shopAPI = {
  // Lấy tất cả shop
  getAllShops: async () => {
    const response = await fetch(`${API_BASE_URL}/shops`);
    if (!response.ok) {
      throw new Error('Failed to fetch shops');
    }
    return response.json();
  },

  // Lấy shop theo ID
  getShopById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/shops/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch shop');
    }
    return response.json();
  },

  // Lấy tên shop (mapping ID -> Name)
  getShopNames: async () => {
    const response = await fetch(`${API_BASE_URL}/shops/names`);
    if (!response.ok) {
      throw new Error('Failed to fetch shop names');
    }
    return response.json();
  }
};
