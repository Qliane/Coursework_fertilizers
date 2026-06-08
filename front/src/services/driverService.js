import api from './api';

export const driverService = {
  getByPartner: async (partnerId) => {
    const response = await api.get(`/partners/${partnerId}/drivers`);
    return response.data.data || [];
  },
  getById: async (id) => {
    const response = await api.get(`/drivers/${id}`);
    return response.data.data;
  },
  create: async (partnerId, data) => {
    const response = await api.post(`/partners/${partnerId}/drivers`, data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/drivers/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    await api.delete(`/drivers/${id}`);
    return id;
  }
};