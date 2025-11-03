import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { productAPI, testServerConnection } from '../../api/product';
import { shopAPI } from '../../api/shop';
import categoryAPI from '../../api/category';
import ImageUpload from '../AdminComponent/ImageUpload';
import { reviewAPI } from '../../api/review';
import StarRating from '../ReviewComponent/StarRating';
import ReviewReply from '../ReviewComponent/ReviewReply';
import { chatAPI } from '../../api/chat';
import './ShopManagement.css';
const ShopManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('products');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showShopForm, setShowShopForm] = useState(false);
  const [showRatings, setShowRatings] = useState(false);
  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    image: null,
    is_available: true,
    status: 'active'
  });
  // Image upload states
  const [productImageUrl, setProductImageUrl] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [shopForm, setShopForm] = useState({
    name: '',
    description: '',
    address: '',
    opening_hours: ''
  });
  // Fetch shop data
  const { data: shopData, isLoading: shopLoading } = useQuery({
    queryKey: ['shop', user?.id],
    queryFn: () => shopAPI.getShopBySellerId(user?.id),
    enabled: !!user?.id
  });
  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', shopData?.data?.id],
    queryFn: () => productAPI.getProductsByShopId(shopData?.data?.id),
    enabled: !!shopData?.data?.id
  });
  // Reviews: stats + list for this shop (seller view)
  const shopId = shopData?.data?.id;
  const { data: reviewStatsData } = useQuery({
    queryKey: ['shopReviewStats', shopId],
    queryFn: () => reviewAPI.getShopReviewStats(shopId),
    enabled: !!shopId,
    staleTime: 60_000,
  });
  const { data: shopReviewsData, isLoading: shopReviewsLoading } = useQuery({
    queryKey: ['shopReviews', shopId],
    queryFn: () => reviewAPI.getShopReviews(shopId),
    enabled: !!shopId,
  });
  // Map productId -> product name for reviews
  const [reviewProductMap, setReviewProductMap] = useState({});
  // Preload all products of this shop for name resolution
  useEffect(() => {
    if (!shopId) return;
    (async () => {
      try {
        const res = await productAPI.getProductsByShopId(shopId);
        const products = res?.data || res || [];
        const map = {};
        (products || []).forEach(p => {
          const id = p.id ?? p.productId;
          const name = p.name ?? p.productName;
          if (id) map[id] = name || `#${id}`;
        });
        if (Object.keys(map).length) setReviewProductMap(map);
      } catch {}
    })();
  }, [shopId]);
  // Reply to a customer review (seller)
  const handleReplyToReview = async (reviewId, content) => {
    try {
      const res = await reviewAPI.replyToReview(reviewId, content);
      if (res?.success) {
        // refresh replies/reviews
        queryClient.invalidateQueries(['shopReviews', shopId]);
        return true;
      } else {
        throw new Error(res?.message || 'Reply failed');
      }
    } catch (e) {
      console.error('Reply error:', e);
      throw e;
    }
  };
  useEffect(() => {
    const list = shopReviewsData?.data;
    if (!list || !Array.isArray(list)) return;
    const ids = Array.from(new Set(list
      .map(r => r.productId)
      .filter(id => typeof id === 'number' && id > 0 && !reviewProductMap[id])));
    if (ids.length === 0) return;
    (async () => {
      try {
        const results = await Promise.all(ids.map(async (pid) => {
          try {
            const res = await productAPI.getProductById(pid);
            const name = res?.data?.name || res?.name || `#${pid}`;
            return [pid, name];
          } catch {
            return [pid, `#${pid}`];
          }
        }));
        setReviewProductMap(prev => {
          const next = { ...prev };
          results.forEach(([pid, name]) => { next[pid] = name; });
          return next;
        });
      } catch {}
    })();
  }, [shopReviewsData]);
  // Fetch categories with fallback data
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        return await categoryAPI.getAllCategories();
      } catch (error) {
        console.error('âŒ Categories API error:', error);
        // Return fallback data if API fails
        return {
          success: true,
          data: [
            { id: 1, name: 'Phá»Ÿ', description: 'Vietnamese noodle soup' },
            { id: 2, name: 'BÃ¡nh MÃ¬', description: 'Vietnamese sandwich' },
            { id: 3, name: 'CÆ¡m', description: 'Rice dishes' },
            { id: 4, name: 'NÆ°á»›c uá»‘ng', description: 'Beverages' },
            { id: 5, name: 'Pizza', description: 'Italian pizza' },
            { id: 6, name: 'BÃºn', description: 'Vietnamese vermicelli' }
          ]
        };
      }
    },
    refetchOnWindowFocus: false,
    retry: 1
  });
  // Debug log for categories
  useEffect(() => {
    if (categoriesData) {
      console.log('ðŸ“‚ Categories loaded:', categoriesData);
    }
    if (categoriesError) {
      console.error('âŒ Categories error:', categoriesError);
    }
  }, [categoriesData, categoriesError]);
  // Test server connection on mount
  useEffect(() => {
    const testConnection = async () => {
      const isConnected = await testServerConnection();
      if (!isConnected) {
        console.warn('âš ï¸ Server connection test failed');
      }
    };
    testConnection();
  }, []);
  // Mutations
  const createProductMutation = useMutation({
    mutationFn: productAPI.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setShowProductForm(false);
      setProductForm({ name: '', description: '', price: '', categoryId: '', image: null, is_available: true, status: 'active' });
      alert('âœ… ThÃªm mÃ³n Äƒn thÃ nh cÃ´ng!');
    },
    onError: (error) => {
      console.error('âŒ Create product error:', error);
      alert('âŒ Lá»—i khi thÃªm mÃ³n Äƒn: ' + error.message);
    }
  });
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const maxRetries = 5;
      let lastError = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`ðŸ”„ Attempt ${attempt}/${maxRetries} for product ${id}`);
          
          // Add delay between attempts
          if (attempt > 1) {
            const delay = Math.pow(2, attempt - 2) * 1000; // 1s, 2s, 4s, 8s
            console.log(`â³ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          // Try with full data first
          if (attempt === 1) {
            return await productAPI.updateProduct(id, data);
          } else {
            // Try with minimal data on retry
            const minimalData = {
              name: data.name,
              description: data.description || '',
              price: data.price,
              categoryId: data.categoryId,
              shopId: data.shopId
            };
            
            console.log(`ðŸ”„ Attempt ${attempt} with minimal data:`, minimalData);
            return await productAPI.updateProduct(id, minimalData);
          }
        } catch (error) {
          lastError = error;
          console.error(`âŒ Attempt ${attempt} failed:`, error);
          
          // If it's a network error, continue to retry
          if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
            console.log('ðŸ”„ Network error detected, will retry...');
            continue;
          }
          
          // If it's a server error, try with even more minimal data
          if (error.message.includes('500') || error.message.includes('Internal server error')) {
            console.log('ðŸ”„ Server error detected, trying with ultra-minimal data...');
            try {
              const ultraMinimalData = {
                name: data.name,
                price: data.price,
                categoryId: data.categoryId,
                shopId: data.shopId
              };
              return await productAPI.updateProduct(id, ultraMinimalData);
            } catch (ultraMinimalError) {
              console.error('âŒ Ultra-minimal data attempt also failed:', ultraMinimalError);
              lastError = ultraMinimalError;
            }
          }
        }
      }
      
      // All attempts failed
      throw lastError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', categoryId: '', image: null, is_available: true, status: 'active' });
      alert('âœ… Cáº­p nháº­t mÃ³n Äƒn thÃ nh cÃ´ng!');
    },
    onError: (error) => {
      console.error('âŒ Update product error:', error);
      
      // Check if it's a server connection issue
      if (error.message.includes('Network error') || error.message.includes('Failed to fetch') || error.message.includes('Cannot connect to server')) {
        alert('âŒ KhÃ´ng thá»ƒ káº¿t ná»‘i Ä‘áº¿n server!\n\nVui lÃ²ng kiá»ƒm tra:\n1. Server cÃ³ Ä‘ang cháº¡y khÃ´ng? (Port 8080)\n2. Káº¿t ná»‘i internet\n3. Thá»­ refresh trang\n4. Kiá»ƒm tra console Ä‘á»ƒ xem chi tiáº¿t lá»—i');
      } else if (error.message.includes('500') || error.message.includes('Internal server error')) {
        alert('âŒ Lá»—i server!\n\nVui lÃ²ng thá»­ láº¡i sau hoáº·c liÃªn há»‡ admin.');
      } else if (error.message.includes('Server not responding properly')) {
        alert('âŒ Server khÃ´ng pháº£n há»“i Ä‘Ãºng cÃ¡ch!\n\nVui lÃ²ng kiá»ƒm tra server cÃ³ Ä‘ang cháº¡y khÃ´ng.');
      } else {
        alert('âŒ Lá»—i khi cáº­p nháº­t mÃ³n Äƒn: ' + error.message + '\n\nVui lÃ²ng thá»­ láº¡i hoáº·c liÃªn há»‡ admin.');
      }
    }
  });
  const deleteProductMutation = useMutation({
    mutationFn: productAPI.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    }
  });
  const updateShopMutation = useMutation({
    mutationFn: ({ id, data }) => {
      console.log('ðŸ“¤ Updating shop:', id, 'with data:', data);
      return shopAPI.updateShop(id, data);
    },
    onSuccess: () => {
      console.log('âœ… Shop updated successfully');
      queryClient.invalidateQueries(['shop']);
      setShowShopForm(false);
      alert('âœ… Cáº­p nháº­t thÃ´ng tin cá»­a hÃ ng thÃ nh cÃ´ng!');
    },
    onError: (error) => {
      console.error('âŒ Update shop error:', error);
      alert('âŒ Lá»—i khi cáº­p nháº­t thÃ´ng tin cá»­a hÃ ng: ' + error.message);
    }
  });
  // Load shop data into form
  useEffect(() => {
    if (shopData?.data) {
      setShopForm({
        name: shopData.data.name || '',
        description: shopData.data.description || '',
        address: shopData.data.address || '',
        opening_hours: shopData.data.opening_hours || ''
      });
    }
  }, [shopData]);
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!productForm.name.trim()) {
      alert('âŒ Vui lÃ²ng nháº­p tÃªn mÃ³n Äƒn');
      return;
    }
    if (!productForm.price || parseFloat(productForm.price) <= 0) {
      alert('âŒ Vui lÃ²ng nháº­p giÃ¡ há»£p lá»‡');
      return;
    }
    if (!productForm.categoryId) {
      alert('âŒ Vui lÃ²ng chá»n danh má»¥c');
      return;
    }
    
    const productData = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: parseFloat(productForm.price),
      categoryId: parseInt(productForm.categoryId),
      shopId: shopData?.data?.id,
      is_available: productForm.is_available,
      status: productForm.status
    };
    // Validate data before sending
    if (!productData.name || !productData.price || !productData.categoryId || !productData.shopId) {
      alert('âŒ Dá»¯ liá»‡u khÃ´ng há»£p lá»‡. Vui lÃ²ng kiá»ƒm tra láº¡i cÃ¡c trÆ°á»ng báº¯t buá»™c.');
      return;
    }
    console.log('ðŸ“¤ Sending product data:', productData);
    try {
      let productResult;
      
      if (editingProduct) {
        // Update existing product
        productResult = await productAPI.updateProduct(editingProduct.id, productData);
      } else {
        // Create new product
        productResult = await productAPI.createProduct(productData);
      }
      
      // Upload image if provided
      if (productForm.image && productResult?.data?.id) {
        console.log('ðŸ“¤ Uploading image for product:', productResult.data.id);
        setIsUploadingImage(true);
        try {
          const uploadResult = await productAPI.uploadProductImage(productResult.data.id, productForm.image);
          console.log('âœ… Image uploaded successfully:', uploadResult);
          setProductImageUrl(uploadResult.data?.imageUrl);
        } catch (imageError) {
          console.error('âŒ Image upload failed:', imageError);
          alert('âš ï¸ Sáº£n pháº©m Ä‘Ã£ Ä‘Æ°á»£c táº¡o/cáº­p nháº­t nhÆ°ng khÃ´ng thá»ƒ táº£i áº£nh lÃªn. Vui lÃ²ng thá»­ láº¡i sau.');
        } finally {
          setIsUploadingImage(false);
        }
      }
      
      // Success
      queryClient.invalidateQueries(['products']);
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', categoryId: '', image: null, is_available: true, status: 'active' });
      setProductImageUrl(null);
      setIsUploadingImage(false);
      alert('âœ… ' + (editingProduct ? 'Cáº­p nháº­t' : 'ThÃªm') + ' mÃ³n Äƒn thÃ nh cÃ´ng!');
      
    } catch (error) {
      console.error('âŒ Product operation failed:', error);
      alert('âŒ Lá»—i khi ' + (editingProduct ? 'cáº­p nháº­t' : 'thÃªm') + ' mÃ³n Äƒn: ' + error.message);
    }
  };
  const handleShopSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!shopForm.name.trim()) {
      alert('âŒ Vui lÃ²ng nháº­p tÃªn cá»­a hÃ ng');
      return;
    }
    
    if (!shopForm.address.trim()) {
      alert('âŒ Vui lÃ²ng nháº­p Ä‘á»‹a chá»‰');
      return;
    }
    
    // Only send fields that should be updated (exclude seller_id)
    const updateData = {
      name: shopForm.name.trim(),
      description: shopForm.description.trim(),
      address: shopForm.address.trim(),
      opening_hours: shopForm.opening_hours.trim()
    };
    
    console.log('ðŸ“¤ Submitting shop update:', updateData);
    updateShopMutation.mutate({ id: shopData?.data?.id, data: updateData });
  };
  const handleEditProduct = async (product) => {
    console.log('ðŸ” Editing product:', product);
    console.log('ðŸ“¦ Product status:', product.status);
    console.log('ðŸ“¦ Product is_available:', product.is_available);
    
    try {
      // Fetch detailed product info from database
      const detailedProduct = await productAPI.getProductById(product.id);
      console.log('ðŸ“¦ Detailed product from API:', detailedProduct);
      
      const productData = detailedProduct.data || detailedProduct;
      
      // Get status value (priority: API data > product data > default)
      let statusValue = 'active';
      if (productData.status) {
        statusValue = productData.status;
      } else if (product.status) {
        statusValue = product.status;
      }
      
      console.log('ðŸ“¦ Final status value:', statusValue);
      
      setEditingProduct(productData);
      setProductForm({
        name: productData.name || product.name,
        description: productData.description || product.description,
        price: (productData.price || product.price).toString(),
        categoryId: productData.categoryId || product.categoryId,
        image: null,
        is_available: productData.is_available !== undefined ? productData.is_available : product.available,
        status: statusValue
      });
      setProductImageUrl(productData.imageUrl || product.imageUrl);
      setShowProductForm(true);
    } catch (error) {
      console.error('âŒ Error fetching product details:', error);
      // Fallback to original product data
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        categoryId: product.categoryId,
        image: null,
        status: product.status || 'active'
      });
      setShowProductForm(true);
    }
  };
  const handleDeleteProduct = (productId) => {
    if (window.confirm('Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a mÃ³n Äƒn nÃ y?')) {
      deleteProductMutation.mutate(productId);
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('âŒ KÃ­ch thÆ°á»›c file quÃ¡ lá»›n. Tá»‘i Ä‘a 5MB.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('âŒ Äá»‹nh dáº¡ng file khÃ´ng há»£p lá»‡. Chá»‰ cháº¥p nháº­n JPEG, PNG, GIF, WebP.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      console.log('ðŸ“ Selected file:', file.name, 'Size:', file.size, 'Type:', file.type);
    }
    
    setProductForm({ ...productForm, image: file });
  };
  if (shopLoading) {
    return <div className="loading">Äang táº£i thÃ´ng tin cá»­a hÃ ng...</div>;
  }
  if (!shopData?.data) {
    return (
      <div className="shop-management">
        <div className="no-shop">
          <h2>Báº¡n chÆ°a cÃ³ cá»­a hÃ ng</h2>
          <p>Vui lÃ²ng Ä‘Äƒng kÃ½ cá»­a hÃ ng trÆ°á»›c khi sá»­ dá»¥ng chá»©c nÄƒng quáº£n lÃ½.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="shop-management">
      <div className="shop-header">
        <h1>{'Qu\u1ea3n l\u00fd c\u1eeda h\u00e0ng'}: {shopData.data.name}</h1>
        <div className="shop-stats">
          <div className="stat-item">
            <span className="stat-label">{'\u0110\u00e1nh gi\u00e1'}:</span>
            <span className="stat-value">{(reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0).toFixed ? (reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0).toFixed(1) : (reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{'S\u1ed1 m\u00f3n \u0103n'}:</span>
            <span className="stat-value">{productsData?.data?.length || 0}</span>
          </div>
        </div>
      </div>
      <div className="management-tabs">
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          {'Qu\u1ea3n l\u00fd m\u00f3n \u0103n'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          {'Th\u00f4ng tin c\u1eeda h\u00e0ng'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'ratings' ? 'active' : ''}`}
          onClick={() => setActiveTab('ratings')}
        >
          {'\u0110\u00e1nh gi\u00e1 kh\u00e1ch h\u00e0ng'}
        </button>
      </div>
      {activeTab === 'products' && (
        <div className="products-section">
          <div className="section-header">
            <h2>{'Danh s\u00e1ch m\u00f3n \u0103n'}</h2>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingProduct(null);
                setProductForm({ name: '', description: '', price: '', categoryId: '', image: null });
                setShowProductForm(true);
              }}
            >
              {'Th\u00eam m\u00f3n \u0103n'}
            </button>
          </div>
          {showProductForm && (
            <div className="modal-overlay" onClick={() => setShowProductForm(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{editingProduct ? 'Sá»­a mÃ³n Äƒn' : 'ThÃªm mÃ³n Äƒn má»›i'}</h3>
                <form onSubmit={handleProductSubmit}>
                  <div className="form-group">
                    <label>TÃªn mÃ³n Äƒn:</label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>MÃ´ táº£:</label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>GiÃ¡ (VNÄ):</label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                    />
                  </div>
                   <div className="form-group">
                     <label>Danh má»¥c:</label>
                     <select
                       value={productForm.categoryId}
                       onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                       required
                       disabled={categoriesLoading}
                     >
                       <option value="">
                         {categoriesLoading ? 'Äang táº£i danh má»¥c...' : 'Chá»n danh má»¥c'}
                       </option>
                       {categoriesData?.data?.map(category => (
                         <option key={category.id} value={category.id}>
                           {category.name}
                         </option>
                       ))}
                     </select>
                     {categoriesError && (
                       <div className="error-message">
                         âš ï¸ Lá»—i khi táº£i danh má»¥c tá»« server. Äang sá»­ dá»¥ng danh má»¥c máº·c Ä‘á»‹nh.
                       </div>
                     )}
                   </div>
                  <div className="form-group">
                    <label>áº¢nh mÃ³n Äƒn:</label>
                    {editingProduct ? (
                      <ImageUpload
                        productId={editingProduct.id}
                        currentImageUrl={productImageUrl}
                        onImageUpdate={(newImageUrl) => {
                          setProductImageUrl(newImageUrl);
                          // Update the product in the list
                          queryClient.invalidateQueries(['products']);
                        }}
                      />
                    ) : (
                      <div className="image-upload-section">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleImageChange}
                        />
                        {productForm.image && (
                          <div className="file-info">
                            <p>ðŸ“ File Ä‘Ã£ chá»n: {productForm.image.name}</p>
                            <p>ðŸ“ KÃ­ch thÆ°á»›c: {(productForm.image.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        )}
                        {isUploadingImage && (
                          <div className="upload-status">
                            <p>â³ Äang upload áº£nh...</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>TÃ¬nh tráº¡ng sáºµn cÃ³:</label>
                    <select
                      value={productForm.is_available}
                      onChange={(e) => setProductForm({ ...productForm, is_available: e.target.value === 'true' })}
                    >
                      <option value={true}>âœ… CÃ³ sáºµn</option>
                      <option value={false}>âŒ KhÃ´ng cÃ³ sáºµn</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tráº¡ng thÃ¡i bÃ¡n hÃ ng:</label>
                    <select
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                    >
                      <option value="active">âœ… Äang bÃ¡n</option>
                      <option value="inactive">â¸ï¸ Táº¡m ngá»«ng bÃ¡n</option>
                      <option value="out_of_stock">âŒ Háº¿t hÃ ng</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowProductForm(false)}>
                      Há»§y
                    </button>
                    <button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                      {createProductMutation.isPending || updateProductMutation.isPending ? 
                        'â³ Äang xá»­ lÃ½...' : 
                        (editingProduct ? 'Cáº­p nháº­t' : 'ThÃªm mÃ³n')
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div className="products-list">
            {productsLoading ? (
              <div className="loading">Äang táº£i danh sÃ¡ch mÃ³n Äƒn...</div>
            ) : productsData?.data?.length > 0 ? (
              productsData.data.map(product => (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => handleEditProduct(product)}
                >
                  <div className="product-image">
                    {product.imageUrl || product.image_url || product.image ? (
                      <img 
                        src={product.imageUrl || product.image_url || product.image} 
                        alt={product.name}
                        onError={(e) => {
                          console.log('âŒ Image load error in shop management:', product.name);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="no-image"
                      style={{ display: product.imageUrl || product.image_url || product.image ? 'none' : 'flex' }}
                    >
                      <div className="no-image-content">
                        <div className="no-image-icon">ðŸ½ï¸</div>
                        <span>KhÃ´ng cÃ³ áº£nh</span>
                      </div>
                    </div>
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <div className="product-details">
                      <span className="price">{product.price.toLocaleString()} VNÄ</span>
                      <span className="category">{product.category?.name}</span>
                    </div>
                    <div className="product-status">
                      <span className={`status ${product.status === 'active' ? 'available' : 'unavailable'}`}>
                        {product.status === 'active' ? 'âœ… CÃ²n hÃ ng' : 
                         product.status === 'inactive' ? 'â¸ï¸ Táº¡m ngá»«ng' : 
                         product.status === 'out_of_stock' ? 'âŒ Háº¿t hÃ ng' : 'âŒ KhÃ´ng xÃ¡c Ä‘á»‹nh'}
                      </span>
                    </div>
                  </div>
                  <div className="product-actions">
                    <button 
                      className="btn btn-edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProduct(product);
                      }}
                    >
                      âœï¸ Sá»­a
                    </button>
                    <button 
                      className="btn btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product.id);
                      }}
                    >
                      ðŸ—‘ï¸ XÃ³a
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-products">
                <p>ChÆ°a cÃ³ mÃ³n Äƒn nÃ o. HÃ£y thÃªm mÃ³n Äƒn Ä‘áº§u tiÃªn!</p>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'shop' && (
        <div className="shop-section">
          <div className="section-header">
            <h2>{'Th\u00f4ng tin c\u1eeda h\u00e0ng'}</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowShopForm(true)}>{'C\u1eadp nh\u1eadt th\u00f4ng tin'}</button>
          </div>
          {showShopForm && (
            <div className="modal-overlay" onClick={() => setShowShopForm(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Cáº­p nháº­t thÃ´ng tin cá»­a hÃ ng</h3>
                <form onSubmit={handleShopSubmit}>
                  <div className="form-group">
                    <label>TÃªn cá»­a hÃ ng:</label>
                    <input
                      type="text"
                      value={shopForm.name}
                      onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>MÃ´ táº£:</label>
                    <textarea
                      value={shopForm.description}
                      onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Äá»‹a chá»‰:</label>
                    <input
                      type="text"
                      value={shopForm.address}
                      onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Giá» má»Ÿ cá»­a:</label>
                    <input
                      type="text"
                      value={shopForm.opening_hours}
                      onChange={(e) => setShopForm({ ...shopForm, opening_hours: e.target.value })}
                      placeholder="VÃ­ dá»¥: 8AM-10PM"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowShopForm(false)}>
                      Há»§y
                    </button>
                    <button type="submit" disabled={updateShopMutation.isPending}>
                      Cáº­p nháº­t
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div className="shop-info">
            <div className="info-card">
              <h3>{'Th\u00f4ng tin c\u01a1 b\u1ea3n'}</h3>
              <div className="info-item">
                <span className="label">{'T\u00ean c\u1eeda h\u00e0ng:'}</span>
                <span className="value">{shopData.data.name}</span>
              </div>
              <div className="info-item">
                <span className="label">{'M\u00f4 t\u1ea3:'}</span>
                <span className="value">{shopData.data.description}</span>
              </div>
              <div className="info-item">
                <span className="label">{'\u0110\u1ecba ch\u1ec9:'}</span>
                <span className="value">{shopData.data.address}</span>
              </div>
              <div className="info-item">
                <span className="label">{'Gi\u1edd m\u1edf c\u1eeda:'}</span>
                <span className="value">{shopData.data.opening_hours || 'Ch\u01b0a c\u1eadp nh\u1eadt'}</span>
              </div>
              <div className="info-item">
                <span className="label">{'\u0110\u00e1nh gi\u00e1 trung b\u00ecnh:'}</span>
                <span className="value">{(reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0).toFixed ? (reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0).toFixed(1) : (reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'ratings' && (
        <div className="ratings-section">
          <div className="section-header">
            <h2>{'\u0110\u00e1nh gi\u00e1 t\u1eeb kh\u00e1ch h\u00e0ng'}</h2>
          </div>
          {/* Real data summary + list */}
          <div className="ratings-summary real">
            <div className="rating-card">
              <h3>{'\u0110\u00e1nh gi\u00e1 t\u1ed5ng quan'}</h3>
              <div className="rating-stats">
                <div className="rating-item">
                  <span className="rating-label">{'T\u1ed5ng s\u1ed1 \u0111\u00e1nh gi\u00e1'}</span>
                  <span className="rating-value">{(reviewStatsData?.data?.averageRating ?? 0).toFixed ? (reviewStatsData?.data?.averageRating ?? 0).toFixed(1) : (reviewStatsData?.data?.averageRating ?? 0)}</span>
                </div>
                <div className="rating-item">
                  <span className="rating-label">Tá»•ng sá»‘ Ä‘Ã¡nh giÃ¡:</span>
                  <span className="rating-value">{reviewStatsData?.data?.reviewCount ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ratings-list real">
            {shopReviewsLoading ? (
              <p>Äang táº£i Ä‘Ã¡nh giÃ¡...</p>
            ) : !shopReviewsData?.data || shopReviewsData.data.length === 0 ? (
              <p>ChÆ°a cÃ³ Ä‘Ã¡nh giÃ¡ nÃ o.</p>
            ) : (
              shopReviewsData.data.map((rv) => (
                <div key={rv.id} className="rating-item-row">
                  <div className="rating-left">
                    <StarRating rating={rv.rating} readOnly />
                    <span className="rating-score">{rv.rating?.toFixed ? rv.rating.toFixed(1) : rv.rating}</span>
                  </div>
                  <div className="rating-right">
                    <div className="rating-meta">
                      <span className="reviewer">KhÃ¡ch #{rv.customerId}</span>
                      <span className="date">{new Date(rv.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                    {rv.productId && rv.productId > 0 && (
                      <div className="rating-product">{'M\u00f3n:'} {reviewProductMap[rv.productId] || `#${rv.productId}`}</div>
                    )}
                    <div className="rating-content">{rv.content}</div>
                    <ReviewReply reviewId={rv.id} userRole={(user?.role || '').toUpperCase()} onReply={handleReplyToReview} />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="ratings-summary">
            <div className="rating-card">
              <h3>ÄÃ¡nh giÃ¡ tá»•ng quan</h3>
              <div className="rating-stats">
                <div className="rating-item">
                  <span className="rating-label">ÄÃ¡nh giÃ¡ trung bÃ¬nh:</span>
                  <span className="rating-value">{(reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0).toFixed ? (reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0).toFixed(1) : (reviewStatsData?.data?.averageRating ?? shopData.data.rating ?? 0)}</span>
                </div>
                <div className="rating-item">
                  <span className="rating-label">Tá»•ng sá»‘ Ä‘Ã¡nh giÃ¡:</span>
                  <span className="rating-value">{shopData.data.totalRatings || 0}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ratings-list">
            <p>Chá»©c nÄƒng xem chi tiáº¿t Ä‘Ã¡nh giÃ¡ sáº½ Ä‘Æ°á»£c phÃ¡t triá»ƒn trong tÆ°Æ¡ng lai.</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default ShopManagement;