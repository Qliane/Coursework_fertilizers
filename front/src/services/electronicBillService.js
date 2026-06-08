import api from './api';

export const electronicBillService = {
  sign: async (billId) => {
    const response = await api.post(`/bills/${billId}/electronic/sign`);
    return response.data.data;
  },
  accept: async (billId) => {
    const response = await api.post(`/bills/${billId}/electronic/accept`);
    return response.data.data;
  },
  getStatus: async (billId) => {
    const response = await api.get(`/bills/${billId}/electronic/status`);
    return response.data.data;
  }
};