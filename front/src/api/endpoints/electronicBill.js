// src/api/endpoints/electronicBill.js
import client from '../client';

export const electronicBillService = {
  sign: async (billId) => {
    const response = await client.post(`/bills/${billId}/sign`);
    return response.data.data;
  },
  accept: async (billId) => {
    const response = await client.post(`/bills/${billId}/accept`);
    return response.data.data;
  },
  getStatus: async (billId) => {
    const response = await client.get(`/bills/${billId}/status`);
    return response.data.data;
  }
};