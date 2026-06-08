import { useState, useEffect, useCallback } from 'react';
import { storageService } from '@/api/endpoints/storage';

export const useStorages = () => {
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStorages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await storageService.getAll();
      setStorages(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки складов');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStorage = async (data) => {
    try {
      const newStorage = await storageService.create(data);
      setStorages(prev => [newStorage, ...prev]);
      return newStorage;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка создания склада');
    }
  };

  const updateStorage = async (id, data) => {
    try {
      const updated = await storageService.update(id, data);
      setStorages(prev => prev.map(s => s.id === updated.id ? updated : s));
      return updated;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка обновления склада');
    }
  };

  const deleteStorage = async (id) => {
    try {
      await storageService.delete(id);
      setStorages(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка удаления склада');
    }
  };

  useEffect(() => {
    fetchStorages();
  }, [fetchStorages]);

  return {
    storages,
    loading,
    error,
    createStorage,
    updateStorage,
    deleteStorage,
    refetch: fetchStorages,
  };
};