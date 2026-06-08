// src/api/client.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// добавляем токен
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.responseType === 'blob') {
      config.headers.Accept = 'application/octet-stream';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// обработка ошибок и blob
client.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob') return response;
    if (response.data && typeof response.data.success !== 'undefined') {
      if (response.data.success === false) {
        return Promise.reject({ response: { data: response.data } });
      }
    }
    return response;
  },
  (error) => {
    if (error.config?.responseType === 'blob' && error.response) {
      return Promise.reject({
        ...error,
        response: { ...error.response, data: error.response.data }
      });
    }
    console.error('API Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default client;