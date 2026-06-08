// src/api/endpoints/storage.js
import client from '../client';

export const storageService = {
  getAll: async () => {
    const response = await client.get('/storages');
    return response.data.data || [];
  },
  getById: async (id) => {
    const response = await client.get(`/storages/${id}`);
    return response.data.data;
  },
  create: async (data) => {
    const response = await client.post('/storages', data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await client.put(`/storages/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    await client.delete(`/storages/${id}`);
    return id;
  },
  getEmployees: async (storageId) => {
    const response = await client.get(`/storages/${storageId}/employees`);
    return response.data.data || [];
  },
  addEmployee: async (storageId, userId, data) => {
    const response = await client.post(`/storages/${storageId}/employees`, { userId, ...data });
    return response.data.data;
  },
  removeEmployee: async (storageId, userId) => {
    await client.delete(`/storages/${storageId}/employees/${userId}`);
    return true;
  }
};