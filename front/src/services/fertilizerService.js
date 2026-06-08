// src/services/fertilizerService.js
import api from './api';

export const fertilizerService = {
  getAll: async () => {
    const response = await api.get('/fertilizers');
    return response.data.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/fertilizers/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/fertilizers', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/fertilizers/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    await api.delete(`/fertilizers/${id}`);
    return id;
  }
};