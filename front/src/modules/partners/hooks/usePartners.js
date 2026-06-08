import { useState, useEffect, useCallback } from 'react';
import { partnerService } from '@/api/endpoints/partner';

export const usePartners = (initialSearch = '') => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(initialSearch);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = search ? { search } : {};
      const data = await partnerService.getAll(params);
      setPartners(data);
    } catch (err) {
      const message = err.response?.data?.error || 'Ошибка загрузки партнёров';
      setError(message);
      console.error('fetchPartners error:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  const createPartner = async (data) => {
    try {
      const newPartner = await partnerService.create(data);
      await fetchPartners();
      return newPartner;
    } catch (err) {
      const message = err.response?.data?.error || 'Ошибка создания партнёра';
      throw new Error(message);
    }
  };

  const updatePartner = async (id, data) => {
    try {
      const updated = await partnerService.update(id, data);
      setPartners(prev => prev.map(p => p.id === updated.id ? updated : p));
      return updated;
    } catch (err) {
      const message = err.response?.data?.error || 'Ошибка обновления партнёра';
      throw new Error(message);
    }
  };

  const deletePartner = async (id) => {
    try {
      await partnerService.delete(id);
      setPartners(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const message = err.response?.data?.error || 'Ошибка удаления партнёра';
      throw new Error(message);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  return {
    partners,
    loading,
    error,
    search,
    setSearch,
    createPartner,
    updatePartner,
    deletePartner,
    refetch: fetchPartners,
  };
};