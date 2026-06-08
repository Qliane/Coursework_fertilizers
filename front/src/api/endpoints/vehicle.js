import client from '../client';

export const vehicleService = {
  getByPartner: async (partnerId) => {
    const response = await client.get(`/partners/${partnerId}/vehicles`);
    return response.data.data || [];
  },
  getById: async (partnerId, id) => {
    const response = await client.get(`/partners/${partnerId}/vehicles/${id}`);
    return response.data.data;
  },
  create: async (partnerId, data) => {
    const response = await client.post(`/partners/${partnerId}/vehicles`, data);
    return response.data.data;
  },
  update: async (partnerId, id, data) => {
    const response = await client.put(`/partners/${partnerId}/vehicles/${id}`, data);
    return response.data.data;
  },
  delete: async (partnerId, id) => {
    await client.delete(`/partners/${partnerId}/vehicles/${id}`);
    return id;
  }
};