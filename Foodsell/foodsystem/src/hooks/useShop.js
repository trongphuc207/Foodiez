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
      const [shopsData, namesData] = await Promise.all([
        shopAPI.getAllShops(),
        shopAPI.getShopNames()
      ]);
      setShops(shopsData);
      setShopNames(namesData);
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
