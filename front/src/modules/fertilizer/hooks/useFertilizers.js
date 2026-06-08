// modules/fertilizer/hooks/useFertilizers.js
import { useState, useEffect, useCallback } from 'react';
import { fertilizerService } from '@/api/endpoints/fertilizer';

export const useFertilizers = () => {
  const [fertilizers, setFertilizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFertilizers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fertilizerService.getAll();
      setFertilizers(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, []);

  const createFertilizer = async (data) => {
    try {
      const newItem = await fertilizerService.create(data);
      setFertilizers(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка создания');
    }
  };

  const updateFertilizer = async (id, data) => {
    try {
      const updated = await fertilizerService.update(id, data);
      setFertilizers(prev => prev.map(f => f.id === updated.id ? updated : f));
      return updated;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка обновления');
    }
  };

  const deleteFertilizer = async (id) => {
    try {
      await fertilizerService.delete(id);
      setFertilizers(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка удаления');
    }
  };

  useEffect(() => { fetchFertilizers(); }, [fetchFertilizers]);

  return { fertilizers, loading, error, fetchFertilizers, createFertilizer, updateFertilizer, deleteFertilizer };
};