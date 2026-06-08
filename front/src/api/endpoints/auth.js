// src/api/endpoints/auth.js
import client from '../client';

export const authService = {
  login: async (username, password) => {
    const response = await client.post('/auth/login', { username, password });
    return response.data;
  },
  logout: async () => {
    try {
      const response = await client.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.warn('Logout API call failed:', error);
      return { success: true, message: 'Выход выполнен' };
    }
  },
  getCurrentUser: async () => {
    const response = await client.get('/auth/me');
    return response.data;
  }
};