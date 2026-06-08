// src/api/endpoints/fertilizer.js
import client from '../client';

export const fertilizerService = {
  getAll: async () => {
    const response = await client.get('/fertilizers');
    return response.data.data || [];
  },
  getById: async (id) => {
    const response = await client.get(`/fertilizers/${id}`);
    return response.data.data;
  },
  create: async (data) => {
    const response = await client.post('/fertilizers', data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await client.put(`/fertilizers/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    await client.delete(`/fertilizers/${id}`);
    return id;
  }
};