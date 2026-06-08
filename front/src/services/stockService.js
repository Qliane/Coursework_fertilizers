// src/services/stockService.js
import api from './api';

export const stockService = {
  getCurrentStock: async () => {
    const response = await api.get('/stock/current');
    return response.data || [];
  },
  
  getStockHistory: async (params) => {
    const response = await api.get('/stock/history', { params });
    return response.data.data || [];
  }
};