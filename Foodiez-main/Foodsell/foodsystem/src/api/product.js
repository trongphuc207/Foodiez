const API_BASE_URL = 'http://localhost:8080/api';


// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get headers with auth
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Export individual functions for backward compatibility
export const getAllProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const result = await response.json();
  // Return just the data array, not the full response object
  return result.data || result;
};

export const searchProducts = async (keyword) => {
  const response = await fetch(`${API_BASE_URL}/products/search?keyword=${encodeURIComponent(keyword)}`);
  if (!response.ok) {
    throw new Error('Failed to search products');
  }
  return response.json();
};

export const createProduct = async (productData) => {
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

};

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
    console.log('📤 API: Fetching products for shop:', shopId);
    const response = await fetch(`${API_BASE_URL}/products/shop/${shopId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch products by shop');
    }
    const data = await response.json();
    console.log('📥 API: Products data:', data);
    if (data.data && data.data.length > 0) {
      console.log('📦 First product details:', data.data[0]);
      console.log('🖼️ First product image fields:', {
        imageUrl: data.data[0].imageUrl,
        image_url: data.data[0].image_url,
        image: data.data[0].image
      });
    }
    return data;
  },

  // Lấy sản phẩm theo ID
  getProductById: async (productId) => {
    console.log('📤 API: Fetching product by ID:', productId);
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    const data = await response.json();
    console.log('📥 API: Product details:', data);
    return data;
  },

  // Tạo sản phẩm mới
  createProduct: async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    return response.json();
  },

  // Upload ảnh cho sản phẩm
  uploadProductImage: async (productId, file) => {
    console.log('📤 API: Uploading image for product:', productId, 'File:', file.name, 'Size:', file.size);
    
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File size too large. Maximum 5MB allowed.');
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', productId);

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData,
      });

      console.log('📥 API: Upload response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Failed to upload product image';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('✅ API: Image upload success:', result);
      return result;
    } catch (error) {
      console.error('❌ API: Image upload error:', error);
      throw error;
    }
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
    console.log('📤 API: Updating product', productId, 'with data:', productData);
    
    // Check if server is running
    try {
      const healthCheck = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      console.log('🏥 Server health check:', healthCheck.status);
    } catch (error) {
      console.warn('⚠️ Server health check failed:', error);
    }
    
    // Validate productId
    if (!productId || isNaN(productId)) {
      throw new Error('Invalid product ID');
    }
    
    // Validate required fields
    if (!productData.name || !productData.price || !productData.categoryId || !productData.shopId) {
      throw new Error('Missing required fields: name, price, categoryId, shopId');
    }
    
    try {
      // Try PATCH first (more RESTful for partial updates)
      const patchData = {
        name: productData.name,
        description: productData.description || '',
        price: productData.price,
        categoryId: productData.categoryId,
        is_available: productData.is_available !== undefined ? productData.is_available : true,
        status: productData.status || 'active'
      };
      
      console.log('📤 API: Sending PATCH data:', patchData);
      
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(patchData),
      });
      
      console.log('📥 API: Response status:', response.status);
      
      if (!response.ok) {
        // Try PUT as fallback
        console.log('🔄 PATCH failed, trying PUT...');
        
        const putResponse = await fetch(`${API_BASE_URL}/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify(patchData),
        });
        
        if (!putResponse.ok) {
          // Try alternative endpoint
          console.log('🔄 PUT failed, trying alternative endpoint...');
          
          const altResponse = await fetch(`${API_BASE_URL}/products/update/${productId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(patchData),
          });
          
          if (!altResponse.ok) {
            let errorMessage = 'Failed to update product';
            try {
              const errorData = await altResponse.json();
              console.error('❌ API: Update product error:', errorData);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (parseError) {
              console.error('❌ API: Could not parse error response:', parseError);
              errorMessage = `Server error (${altResponse.status}): ${altResponse.statusText}`;
            }
            throw new Error(errorMessage);
          }
          
          const result = await altResponse.json();
          console.log('✅ API: Update product success (Alternative):', result);
          return result;
        }
        
        const result = await putResponse.json();
        console.log('✅ API: Update product success (PUT):', result);
        return result;
      }
      
      const result = await response.json();
      console.log('✅ API: Update product success (PATCH):', result);
      return result;
    } catch (error) {
      console.error('❌ API: Network or parsing error:', error);
      throw new Error(`Network error: ${error.message}`);
    }
  },

  // Xóa sản phẩm
  deleteProduct: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
    return response.ok;
  }
};