// Simple favorites persistence helper (localStorage) with optional server sync
// Keyed by user id when available, otherwise a guest key.
import { getAuthToken } from '../api/auth';

const API_BASE = 'http://localhost:8080/api';

// Helper to get auth token
const getToken = () => {
  return localStorage.getItem('authToken');
};

const getKey = (user) => {
  if (user && (user.id || user._id)) return `favorites_${user.id || user._id}`;
  return 'favorites_guest';
};

export const loadFavoritesForUser = (user) => {
  try {
    const raw = localStorage.getItem(getKey(user));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('favorites: failed to load', e);
    return [];
  }
};

export const saveFavoritesForUser = (user, arr) => {
  try {
    localStorage.setItem(getKey(user), JSON.stringify(arr));
    return arr;
  } catch (e) {
    console.error('favorites: failed to save', e);
    return arr;
  }
};

// Server API helpers (async)
export const fetchServerFavorites = async () => {
  try {
    const token = getToken();
    console.log('🔑 fetchServerFavorites - Token:', token ? 'exists' : 'missing');
    if (!token) throw new Error('No auth token');
    const res = await fetch(`${API_BASE}/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log('📦 fetchServerFavorites - Response status:', res.status);
    if (!res.ok) {
      console.warn('favorites: server fetch failed', res.status);
      return null;
    }
    const data = await res.json();
    console.log('📦 fetchServerFavorites - Data:', data);
    // Expecting array of productIds or objects; normalize
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return null;
  } catch (e) {
    console.warn('favorites: fetchServerFavorites error', e);
    return null;
  }
};

export const addServerFavorite = async (productId) => {
  try {
    const token = getToken();
    console.log('➕ addServerFavorite - ProductId:', productId, 'Token:', token ? 'exists' : 'missing');
    if (!token) throw new Error('No auth token');
    const res = await fetch(`${API_BASE}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });
    console.log('➕ addServerFavorite - Response:', res.status, res.ok);
    return res.ok;
  } catch (e) {
    console.warn('favorites: addServerFavorite error', e);
    return false;
  }
};

export const removeServerFavorite = async (productId) => {
  try {
    const token = getToken();
    console.log('➖ removeServerFavorite - ProductId:', productId, 'Token:', token ? 'exists' : 'missing');
    if (!token) throw new Error('No auth token');
    const res = await fetch(`${API_BASE}/favorites/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    console.log('➖ removeServerFavorite - Response:', res.status, res.ok);
    return res.ok;
  } catch (e) {
    console.warn('favorites: removeServerFavorite error', e);
    return false;
  }
};

// Toggle locally then attempt to sync with server in background if authenticated
export const toggleFavoriteForUser = (user, productId) => {
  const arr = loadFavoritesForUser(user);
  const idx = arr.indexOf(productId);
  let action = 'add';
  if (idx === -1) {
    arr.push(productId);
    action = 'add';
  } else {
    arr.splice(idx, 1);
    action = 'remove';
  }
  saveFavoritesForUser(user, arr);

  // Dispatch an event so other components (profile) can react
  try {
    const ev = new CustomEvent('favoritesUpdated', { detail: arr.slice() });
    window.dispatchEvent(ev);
  } catch (e) {
    // ignore for older browsers
  }

  // Fire-and-forget server sync
  (async () => {
    try {
      const token = getToken();
      console.log('🔄 toggleFavoriteForUser - Syncing to server, action:', action, 'productId:', productId);
      if (!token) {
        console.log('⚠️ No token, skipping server sync');
        return;
      }
      if (action === 'add') {
        await addServerFavorite(productId);
      } else {
        await removeServerFavorite(productId);
      }
    } catch (e) {
      console.warn('favorites: background sync failed', e);
    }
  })();

  return arr;
};

export const isProductFavoritedForUser = (user, productId) => {
  const arr = loadFavoritesForUser(user);
  return arr.includes(productId);
};

// Define the object first and assign it to a const
const favoriteService = {
  loadFavoritesForUser,
  saveFavoritesForUser,
  toggleFavoriteForUser,
  isProductFavoritedForUser,
  fetchServerFavorites,
  addServerFavorite,
  removeServerFavorite,
};

// Then export it as default
export default favoriteService;
