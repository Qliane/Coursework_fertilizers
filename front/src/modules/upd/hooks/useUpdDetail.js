import { useState, useEffect, useCallback } from 'react';
import { updService } from '@/api/endpoints/upd';
import { billService } from '@/api/endpoints/bill';
import { electronicBillService } from '@/api/endpoints/electronicBill';
import { vehicleService } from '@/api/endpoints/vehicle';
import { driverService } from '@/api/endpoints/driver';
import { fertilizerService } from '@/api/endpoints/fertilizer';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const useUpdDetail = (updId) => {
  const { user } = useAuth();
  const [upd, setUpd] = useState(null);
  const [bills, setBills] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [fertilizers, setFertilizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const updData = await updService.getById(updId);
      setUpd(updData);

      const [billsData, vehiclesData, driversData, fertilizersData] = await Promise.all([
        billService.getByUpd(updId),
        vehicleService.getByPartner(updData.partnerid).catch(() => []),
        driverService.getByPartner(updData.partnerid).catch(() => []),
        fertilizerService.getAll(),
      ]);

      setVehicles(vehiclesData);
      setDrivers(driversData);
      setFertilizers(fertilizersData);

      setBills(billsData);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [updId]);

  const createBill = async (billData) => {
    try {
      const newBill = await billService.create(updId, billData);
      await loadData();
      return newBill;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка создания накладной');
    }
  };

  const updateBill = async (billId, billData) => {
    try {
      const updated = await billService.update(updId, billId, billData);
      await loadData();
      return updated;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка обновления накладной');
    }
  };

  const deleteBill = async (billId) => {
    try {
      await billService.delete(billId);
      await loadData();
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка удаления накладной');
    }
  };

  const shipUpd = async () => {
    try {
      const result = await updService.ship(updId);
      await loadData();
      return result;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка отгрузки');
    }
  };

  const signElectronicBill = async (billId) => {
    try {
      let result;
      if (user?.roleId === 2) { // Директор
        result = await electronicBillService.sign(billId);
      } else if (user?.roleId === 4) { // Доверенное лицо
        const bill = bills.find(b => b.id === billId);
        if (bill?.electronicBillStatus === 1) {
          result = await electronicBillService.sign(billId);
        } else if (bill?.electronicBillStatus === 2) {
          result = await electronicBillService.accept(billId);
        } else {
          throw new Error('Невозможно подписать/принять ЭТрН в текущем статусе');
        }
      } else {
        throw new Error('Нет прав для подписания ЭТрН');
      }
      await loadData();
      return result;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка подписания ЭТрН');
    }
  };

  useEffect(() => {
    if (updId) loadData();
  }, [updId, loadData]);

  return {
    upd,
    bills,
    vehicles,
    drivers,
    fertilizers,
    loading,
    error,
    createBill,
    updateBill,
    deleteBill,
    shipUpd,
    signElectronicBill,
    refetch: loadData,
  };
};