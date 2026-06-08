// src/modules/stock/hooks/useStock.js
import { useState, useEffect, useCallback } from 'react';
import { stockService } from '@/api/endpoints/stock';

export const useStock = (storageId) => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = storageId ? { storageId } : {};
      const data = await stockService.getCurrentStock(params);
      setStock(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки данных склада');
    } finally {
      setLoading(false);
    }
  }, [storageId]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  return { stock, loading, error, refetch: fetchStock };
};