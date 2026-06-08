// src/api/endpoints/report.js
import client from '../client';

export const reportService = {
  generateStockReport: async (params = {}) => {
    const defaultParams = { period: 'month', format: 'txt' };
    const queryParams = { ...defaultParams, ...params };
    const response = await client.get('/reports/stock', {
      params: queryParams,
      responseType: 'blob'
    });
    const contentDisposition = response.headers['content-disposition'];
    let fileName = `stock_report_${new Date().toISOString().split('T')[0]}.${queryParams.format}`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+)"?/);
      if (match && match[1]) fileName = match[1];
    }
    return { blob: response.data, fileName, format: queryParams.format };
  },
  getReportData: async (params = {}) => {
    const response = await client.get('/reports/stock', {
      params: { ...params, format: 'json' }
    });
    return response.data.data || response.data;
  }
};