import { useState, useEffect, useCallback } from 'react';
import { storageService } from '@/api/endpoints/storage';
import { orderService } from '@/api/endpoints/order';

export const useStorageDetails = (storageId) => {
  const [storage, setStorage] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [storageData, employeesData, ordersData] = await Promise.all([
        storageService.getById(storageId),
        storageService.getEmployees(storageId),
        orderService.getOrders({ storageId }),
      ]);
      setStorage(storageData);
      setEmployees(employeesData);
      setOrders(ordersData.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки данных склада');
    } finally {
      setLoading(false);
    }
  }, [storageId]);

  const addEmployee = async (data) => {
    try {
      const newEmployee = await storageService.addEmployee(storageId, data.userId, data);
      setEmployees(prev => [...prev, newEmployee]);
      return newEmployee;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка добавления сотрудника');
    }
  };

  const updateEmployee = async (userId, data) => {
    try {
      const updated = await storageService.updateEmployee(storageId, userId, data);
      setEmployees(prev => prev.map(e => e.userId === userId ? updated : e));
      return updated;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка обновления сотрудника');
    }
  };

  const deleteEmployee = async (userId) => {
    try {
      await storageService.removeEmployee(storageId, userId);
      setEmployees(prev => prev.filter(e => e.userId !== userId));
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка удаления сотрудника');
    }
  };

  useEffect(() => {
    if (storageId) loadData();
  }, [storageId, loadData]);

  return {
    storage,
    employees,
    orders,
    loading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: loadData,
  };
};