import { useState, useEffect, useCallback } from 'react';
import { containerService } from '@/api/endpoints/container';

export const useContainers = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContainers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await containerService.getAll();
      setContainers(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки тары');
    } finally {
      setLoading(false);
    }
  }, []);

  const createContainer = async (data) => {
    try {
      const newContainer = await containerService.create(data);
      setContainers(prev => [newContainer, ...prev]);
      return newContainer;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка создания тары');
    }
  };

  const updateContainer = async (id, data) => {
    try {
      const updated = await containerService.update(id, data);
      setContainers(prev => prev.map(c => c.id === updated.id ? updated : c));
      return updated;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка обновления тары');
    }
  };

  const deleteContainer = async (id) => {
    try {
      await containerService.delete(id);
      setContainers(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка удаления тары');
    }
  };

  useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  return {
    containers,
    loading,
    error,
    createContainer,
    updateContainer,
    deleteContainer,
    refetch: fetchContainers,
  };
};