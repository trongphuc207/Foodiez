import axios from 'axios';

const API_URL = 'http://localhost:8080/api/favorites';

// Get user's favorites
export const getFavorites = async () => {
  const token = localStorage.getItem('authToken');
  console.log('🔑 Token from localStorage:', token ? 'exists' : 'missing');
  
  const response = await axios.get(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('📦 Favorites API response:', response.data);
  return response.data;
};

// Add product to favorites
export const addFavorite = async (productId) => {
  const token = localStorage.getItem('authToken');
  const response = await axios.post(API_URL, 
    { productId },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// Remove product from favorites
export const removeFavorite = async (productId) => {
  const token = localStorage.getItem('authToken');
  const response = await axios.delete(`${API_URL}/${productId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

// Toggle favorite (add if not exists, remove if exists)
export const toggleFavorite = async (productId) => {
  try {
    const favorites = await getFavorites();
    const isFavorite = favorites.data?.some(fav => fav.productId === productId);
    
    if (isFavorite) {
      return await removeFavorite(productId);
    } else {
      return await addFavorite(productId);
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};
