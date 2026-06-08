import api from './api';

export const vehicleService = {
  getByPartner: async (partnerId) => {
    const response = await api.get(`/partners/${partnerId}/vehicles`);
    return response.data.data || [];
  },
  getById: async (id) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data.data;
  },
  create: async (partnerId, data) => {
    const response = await api.post(`/partners/${partnerId}/vehicles`, data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    await api.delete(`/vehicles/${id}`);
    return id;
  }
};