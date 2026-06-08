import api from './api';

export const updService = {
  getAll: async (params = {}) => {
    const response = await api.get('/upd', { params });
    return response.data.data || [];
  },
  getById: async (id) => {
    const response = await api.get(`/upd/${id}`);
    return response.data.data;
  },
  create: async (data) => {
    const response = await api.post('/upd', data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/upd/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    await api.delete(`/upd/${id}`);
    return id;
  },
  ship: async (id) => {
    const response = await api.post(`/upd/${id}/ship`);
    return response.data.data;
  }
};