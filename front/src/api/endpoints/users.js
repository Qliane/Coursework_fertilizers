// src/api/endpoints/users.js
import client from '../client';

export const userService = {
    getAll: async (params = {}) => {
        const response = await client.get('/users', { params });
        return response.data.data || [];
    },
    getById: async (id) => {
        const response = await client.get(`/users/${id}`);
        return response.data.data;
    },
    create: async (data) => {
        const response = await client.post('/users', data);
        return response.data.data;
    },
    update: async (id, data) => {
        const response = await client.put(`/users/${id}`, data);
        return response.data.data;
    },
    delete: async (id) => {
        await client.delete(`/users/${id}`);
        return id;
    }
};