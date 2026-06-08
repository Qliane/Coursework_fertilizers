import api from './api';

export const billService = {
  getByUpd: async (updId) => {
    const response = await api.get(`/upd/${updId}/bills`);
    return response.data.data || [];
  },
  getById: async (id) => {
    const response = await api.get(`/bills/${id}`);
    return response.data.data;
  },
  create: async (updId, data) => {
    const response = await api.post(`/upd/${updId}/bills`, data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/bills/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    await api.delete(`/bills/${id}`);
    return id;
  }
};