import { getAuthToken } from './auth';

const API_BASE = 'http://localhost:8080/api';

export const addressAPI = {
  getAddresses: async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${API_BASE}/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch addresses');
      return await response.json();
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  },

  addAddress: async (addressData) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${API_BASE}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });

      if (!response.ok) throw new Error('Failed to add address');
      return await response.json();
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  },

  updateAddress: async (addressId, addressData) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${API_BASE}/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });

      if (!response.ok) throw new Error('Failed to update address');
      return await response.json();
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  },

  deleteAddress: async (addressId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${API_BASE}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete address');
      return true;
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  },

  setDefaultAddress: async (addressId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${API_BASE}/addresses/${addressId}/default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to set default address');
      return await response.json();
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }
};

export default addressAPI;