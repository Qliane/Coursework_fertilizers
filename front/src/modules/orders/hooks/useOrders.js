import { useState, useEffect, useCallback } from 'react';
import { orderService } from '@/api/endpoints/order';
import { storageService } from '@/api/endpoints/storage';
import { ORDER_STATUS } from '@/utils/constants';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const useOrders = (initialFilters = {}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const selectedStorageId = user.storageId;
  const [filters, setFilters] = useState({
    status: ORDER_STATUS.ALL,
    startDate: null,
    endDate: null,
    storageId: selectedStorageId,
    search: '',
    page: 1,
    limit: 20,
    ...initialFilters
  });
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [storages, setStorages] = useState([]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters, page: filters.page, limit: filters.limit };
      if (filters.status !== ORDER_STATUS.ALL) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate.toISOString().split('T')[0];
      if (filters.endDate) params.endDate = filters.endDate.toISOString().split('T')[0];
      if (filters.storageid) params.storageId = filters.storageid;
      const result = await orderService.getOrders(params);
      setOrders(result.data);
      setPagination(result.meta.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки ордеров');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStorages = useCallback(async () => {
    try {
      const data = await storageService.getAll();
      setStorages(data);
    } catch (err) {
      console.error('Ошибка загрузки складов', err);
    }
  }, []);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      status: ORDER_STATUS.ALL,
      startDate: null,
      endDate: null,
      storageId: undefined,
      search: '',
      page: 1,
      limit: filters.limit,
    });
  };

  const receiveOrder = async (orderId) => {
    try {
      await orderService.receiveOrder(orderId, []);
      await fetchOrders(); // обновляем список
      return { success: true };
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка приёмки');
    }
  };

  useEffect(() => {
    if (selectedStorageId) {
      updateFilter('storageId', selectedStorageId);
    }
  }, [selectedStorageId]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { fetchStorages(); }, [fetchStorages]);

  return {
    orders,
    loading,
    error,
    filters,
    pagination,
    storages,
    updateFilter,
    resetFilters,
    receiveOrder,
    refetch: fetchOrders,
    setPage: (page) => updateFilter('page', page),
  };
};