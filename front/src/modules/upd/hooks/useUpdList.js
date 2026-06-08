// src/modules/upd/hooks/useUpdList.js
import { useState, useEffect, useCallback } from 'react';
import { updService } from '@/api/endpoints/upd';

export const useUpdList = (partnerId, dateFrom, dateTo) => {
  const [upds, setUpds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUpds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (partnerId) params.partnerId = partnerId;
      if (dateFrom) params.dateFrom = dateFrom.toISOString().split('T')[0];
      if (dateTo) params.dateTo = dateTo.toISOString().split('T')[0];
      const data = await updService.getAll(params);
      setUpds(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки УПД');
    } finally {
      setLoading(false);
    }
  }, [partnerId, dateFrom, dateTo]); // зависим от примитивов

  useEffect(() => {
    fetchUpds();
  }, [fetchUpds]);

  const shipUpd = async (updId) => {
    try {
      const result = await updService.ship(updId);
      await fetchUpds();
      return result;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка отгрузки');
    }
  };

  return {
    upds,
    loading,
    error,
    shipUpd,
    refetch: fetchUpds,
  };
};