// src/api/endpoints/stock.js
import client from '../client';

export const stockService = {
  getCurrentStock: async (params = {}) => {
    const response = await client.get('/stock/current', { params });
    return response.data || [];
  },
  getStockHistory: async (params) => {
    const response = await client.get('/stock/history', { params });
    return response.data.data || [];
  }
};