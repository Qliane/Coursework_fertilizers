// src/api/endpoints/bill.js
import client from '../client';

export const billService = {
  getByUpd: async (updId) => {
    const response = await client.get(`/upd/${updId}/bills`);
    return response.data.data || [];
  },
  getById: async (id) => {
    const response = await client.get(`/bills/${id}`);
    return response.data.data;
  },
  create: async (updId, data) => {
    const response = await client.post(`/upd/${updId}/bills`, data);
    return response.data.data;
  },
  update: async (updId, id, data) => {
    const response = await client.put(`/upd/${updId}/bills/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    await client.delete(`/bills/${id}`);
    return id;
  }
};