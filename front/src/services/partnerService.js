import api from './api';

export const partnerService = {
  getAll: async (params = {}) => {
    const response = await api.get('/partners', { params });
    return response.data.data || [];
  },
  getById: async (id) => {
    const response = await api.get(`/partners/${id}`);
    return response.data.data;
  },
  create: async (data) => {
    const response = await api.post('/partners', data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/partners/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    await api.delete(`/partners/${id}`);
    return id;
  }
};