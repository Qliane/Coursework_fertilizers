// src/api/endpoints/order.js
import client from '../client';

export const orderService = {
  getOrders: async (params = {}) => {
    const response = await client.get('/orders', { params });
    return {
      data: response.data.data || [],
      meta: response.data.meta || {}
    };
  },
  getOrderById: async (id) => {
    const response = await client.get(`/orders/${id}`);
    return response.data.data;
  },
  createOrder: async (data) => {
    const response = await client.post('/orders', data);
    return response.data.data;
  },
  receiveOrder: async (id, data = []) => {
    const response = await client.post(`/orders/${id}/receive`, data);
    return response.data.data;
  },
  updateOrder: async (id, data) => {
    const response = await client.put(`/orders/${id}`, data);
    return response.data.data;
  },
  deleteOrder: async (id) => {
    await client.delete(`/orders/${id}`);
    return id;
  }
};