// src/services/api.js
import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';
const api = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
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
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob') {
      return response;
    }
    
    if (response.data && typeof response.data.success !== 'undefined') {
      if (response.data.success === false) {
        return Promise.reject({
          response: {
            data: response.data
          }
        });
      }
    }
    return response;
  },
  (error) => {
    if (error.config?.responseType === 'blob' && error.response) {
      return Promise.reject({
        ...error,
        response: {
          ...error.response,
          data: error.response.data
        }
      });
    }
    
    if (error.response) {
      const { status } = error.response;
      
      switch (status) {
        case 403:
          console.error('Доступ запрещен');
          break;
        case 404:
          console.error('Ресурс не найден');
          break;
        case 500:
          console.error('Ошибка сервера');
          break;
        default:
          console.error('Неизвестная ошибка:', error.message);
      }
    } else if (error.request) {
      console.error('Ошибка сети:', error.message);
    } else {
      console.error('Ошибка:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;