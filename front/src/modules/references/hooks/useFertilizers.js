import { useState, useEffect, useCallback } from 'react';
import { fertilizerService } from '@/api/endpoints/fertilizer';
import { containerService } from '@/api/endpoints/container';

export const useFertilizers = () => {
  const [fertilizers, setFertilizers] = useState([]);
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ferts, conts] = await Promise.all([
        fertilizerService.getAll(),
        containerService.getAll(),
      ]);
      setFertilizers(ferts);
      setContainers(conts);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, []);

  const createFertilizer = async (data) => {
    try {
      const newFertilizer = await fertilizerService.create(data);
      setFertilizers(prev => [newFertilizer, ...prev]);
      return newFertilizer;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка создания удобрения');
    }
  };

  const updateFertilizer = async (id, data) => {
    try {
      const updated = await fertilizerService.update(id, data);
      setFertilizers(prev => prev.map(f => f.id === updated.id ? updated : f));
      return updated;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка обновления удобрения');
    }
  };

  const deleteFertilizer = async (id) => {
    try {
      await fertilizerService.delete(id);
      setFertilizers(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка удаления удобрения');
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    fertilizers,
    containers,
    loading,
    error,
    createFertilizer,
    updateFertilizer,
    deleteFertilizer,
    refetch: fetchData,
  };
};