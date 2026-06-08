// src/services/reportService.js
import api from './api';

const REPORTS_BASE = '/reports';

/**
 * Универсальная функция для получения отчёта в формате JSON
 */
const getReport = async (endpoint, params) => {
  const response = await api.get(`${REPORTS_BASE}${endpoint}`, {
    params: { ...params, format: 'json' }
  });
  return response.data.data || [];
};

/**
 * Скачивание отчёта в формате CSV/PDF
 */
const downloadReport = async (endpoint, params, format) => {
  const response = await api.get(`${REPORTS_BASE}${endpoint}`, {
    params: { ...params, format },
    responseType: 'blob'
  });

  const contentDisposition = response.headers['content-disposition'];
  let fileName = `${endpoint.replace(/\//g, '_')}_${new Date().toISOString().slice(0,19)}.${format}`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?(.+)"?/);
    if (match && match[1]) fileName = match[1];
  }

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const reportService = {
  getCurrentStock: (params) => getReport('/stock/current', params),
  downloadCurrentStock: (params, format) => downloadReport('/stock/current', params, format),

  getIncoming: (params) => getReport('/incoming', params),
  downloadIncoming: (params, format) => downloadReport('/incoming', params, format),

  getOutgoing: (params) => getReport('/outgoing', params),
  downloadOutgoing: (params, format) => downloadReport('/outgoing', params, format),
};