import client from '../client';

export const driverService = {
  getByPartner: async (partnerId) => {
    const response = await client.get(`/partners/${partnerId}/drivers`);
    return response.data.data || [];
  },
  getById: async (partnerId, id) => {
    const response = await client.get(`/partners/${partnerId}/drivers/${id}`);
    return response.data.data;
  },
  create: async (partnerId, data) => {
    const response = await client.post(`/partners/${partnerId}/drivers`, data);
    return response.data.data;
  },
  update: async (partnerId, id, data) => {
    const response = await client.put(`/partners/${partnerId}/drivers/${id}`, data);
    return response.data.data;
  },
  delete: async (partnerId, id) => {
    await client.delete(`/partners/${partnerId}/drivers/${id}`);
    return id;
  }
};