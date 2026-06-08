// src/api/endpoints/upd.js
import client from '../client';

export const updService = {
  getAll: async (params = {}) => {
    const response = await client.get('/upd', { params });
    return response.data.data || [];
  },
  getById: async (id) => {
    const response = await client.get(`/upd/${id}`);
    return response.data.data;
  },
  create: async (data) => {
    const response = await client.post('/upd', data);
    return response.data.data;
  },
  update: async (id, data) => {
    const response = await client.put(`/upd/${id}`, data);
    return response.data.data;
  },
  delete: async (id) => {
    await client.delete(`/upd/${id}`);
    return id;
  },
  ship: async (id) => {
    const response = await client.post(`/upd/${id}/ship`);
    return response.data.data;
  },
    /**
   * Получить список УПД, в которых участвует текущий водитель, с фильтрацией.
   * @param {Object} params - параметры фильтрации
   * @param {string} params.ebStatus - статус ЭТрН: 'pending', 'transferred', 'accepted' или 'all'
   * @param {string} params.dateFrom - дата начала (YYYY-MM-DD)
   * @param {string} params.dateTo - дата конца (YYYY-MM-DD)
   */
  getDriverUpds: async (params = {}) => {
    const queryParams = {};
    if (params.ebStatus && params.ebStatus !== 'all') {
      queryParams.ebStatus = params.ebStatus;
    }
    if (params.dateFrom) queryParams.dateFrom = params.dateFrom;
    if (params.dateTo) queryParams.dateTo = params.dateTo;
    
    const response = await client.get('/driver/upds', { params: queryParams });
    return response.data.data; // { driver, upds }
  }
};