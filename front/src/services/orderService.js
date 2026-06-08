// src/services/orderService.js
import api from './api';

export const orderService = {
  getOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return {
      data: response.data.data || [],
      meta: response.data.meta || {}
    };
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  createOrder: async (data) => {
    const response = await api.post('/orders', data);
    return response.data.data;
  },

  receiveOrder: async (id, data = []) => {
    const response = await api.post(`/orders/${id}/receive`, data);
    return response.data.data;
  },

  updateOrder: async (id, data) => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data.data;
  },

  deleteOrder: async (id) => {
    await api.delete(`/orders/${id}`);
    return id;
  }
};