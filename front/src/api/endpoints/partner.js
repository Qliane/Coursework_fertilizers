// src/api/endpoints/partner.js
import client from '../client';

export const partnerService = {
  getAll: async (params = {}) => {
    const response = await client.get('/partners', { params });
    return response.data.data || [];
  },
  getById: async (id) => {
    const response = await client.get(`/partners/${id}`);
    return response.data.data;
  },
  create: async (data) => {
    const response = await client.post('/partners', data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await client.put(`/partners/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    await client.delete(`/partners/${id}`);
    return id;
  }
};