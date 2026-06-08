import api from './api';

export const storageService = {
  getAll: async () => {
    const response = await api.get('/storages');
    return response.data.data || [];
  },
  getById: async (id) => {
    const response = await api.get(`/storages/${id}`);
    return response.data.data;
  },
  create: async (data) => {
    const response = await api.post('/storages', data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/storages/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    await api.delete(`/storages/${id}`);
    return id;
  },
  getEmployees: async (storageId) => {
    const response = await api.get(`/storages/${storageId}/employees`);
    return response.data.data || [];
  },
  addEmployee: async (storageId, userId) => {
    const response = await api.post(`/storages/${storageId}/employees`, { userId });
    return response.data.data;
  },
  removeEmployee: async (storageId, userId) => {
    await api.delete(`/storages/${storageId}/employees/${userId}`);
    return true;
  }
};