import { useState, useEffect } from 'react';
import { shopAPI } from '../api/shop';

export const useShop = () => {
  const [shops, setShops] = useState([]);
  const [shopNames, setShopNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const shopsResponse = await shopAPI.getAllShops();
      setShops(shopsResponse.data || []);
      
      // Tạo shopNames từ shops data
      const namesMap = {};
      if (shopsResponse.data) {
        shopsResponse.data.forEach(shop => {
          namesMap[shop.id] = shop.name;
        });
      }
      setShopNames(namesMap);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching shops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const getShopName = (shopId) => {
    return shopNames[shopId] || `Shop ${shopId}`;
  };

  const refreshShops = () => {
    fetchShops();
  };

  return {
    shops,
    shopNames,
    loading,
    error,
    getShopName,
    refreshShops
  };
};


