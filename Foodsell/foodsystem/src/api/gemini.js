import { getAuthToken } from './auth';

const API_BASE_URL = process.env.REACT_APP_ORDER_URL ? `${process.env.REACT_APP_ORDER_URL}/api/gemini` : 'http://localhost:8080/api/gemini';

const parseResponse = async (res) => {
  const text = await res.text();
  try { 
    return JSON.parse(text); 
  } catch { 
    return text ? { success: false, message: text } : {}; 
  }
};

const request = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await parseResponse(res);
  if (!res.ok) {
    const message = (data && data.message) || `${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return data;
};

export const geminiAPI = {
  chat: async (message) => {
    const token = getAuthToken();
    const headers = { 
      'Content-Type': 'application/json'
    };
    
    // Thêm token nếu có (không bắt buộc vì endpoint là public)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return request(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message })
    });
  }
};

