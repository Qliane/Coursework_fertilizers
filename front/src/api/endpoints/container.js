// src/api/endpoints/container.js
import client from '../client';

export const containerService = {
  getAll: async () => {
    const response = await client.get('/containers');
    return response.data.data || [];
  },
  getById: async (id) => {
    const response = await client.get(`/containers/${id}`);
    return response.data.data;
  },
  create: async (data) => {
    const response = await client.post('/containers', data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await client.put(`/containers/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    await client.delete(`/containers/${id}`);
    return id;
  }
};