// src/services/containerService.js
import api from './api';

export const containerService = {
  getAll: async () => {
    const response = await api.get('/containers');
    return response.data.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/containers/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/containers', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/containers/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/containers/${id}`);
    return id;
  }
};