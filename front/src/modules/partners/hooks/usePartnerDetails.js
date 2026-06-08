import { useState, useEffect, useCallback } from 'react';
import { partnerService } from '@/api/endpoints/partner';
import { updService } from '@/api/endpoints/upd';
import { vehicleService } from '@/api/endpoints/vehicle';
import { driverService } from '@/api/endpoints/driver';

export const usePartnerDetails = (partnerId) => {
  const [partner, setPartner] = useState(null);
  const [upds, setUpds] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [partnerData, updData, vehicleData, driverData] = await Promise.all([
        partnerService.getById(partnerId),
        updService.getAll({ partnerId }),
        vehicleService.getByPartner(partnerId),
        driverService.getByPartner(partnerId),
      ]);
      setPartner(partnerData);
      setUpds(updData);
      setVehicles(vehicleData);
      setDrivers(driverData);
    } catch (err) {
      const message = err.response?.data?.error || 'Ошибка загрузки данных партнёра';
      setError(message);
      console.error('loadAll error:', err);
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  const addUpd = async (data) => {
    try {
      const created = await updService.create({
        conclDate: data.conclDate,
        partnerId: partnerId,
        storageId: data.storageId
      });
      setUpds(prev => [created, ...prev]);
      return created;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка создания УПД');
    }
  };

  const updateUpd = async (updId, data) => {
    try {
      const updated = await updService.update(updId, data);
      setUpds(prev => prev.map(u => u.id === updated.id ? updated : u));
      return updated;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка обновления УПД');
    }
  };

  const deleteUpd = async (updId) => {
    try {
      await updService.delete(updId);
      setUpds(prev => prev.filter(u => u.id !== updId));
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Ошибка удаления УПД');
    }
  };

const addVehicle = async (data) => {
  const created = await vehicleService.create(partnerId, data);
  setVehicles(prev => [created, ...prev]);
  return created;
};

const updateVehicle = async (vehicleId, data) => {
  const updated = await vehicleService.update(partnerId, vehicleId, data);
  setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v));
  return updated;
};

const deleteVehicle = async (vehicleId) => {
  await vehicleService.delete(partnerId, vehicleId);
  await loadAll();
};

// CRUD для водителей
const addDriver = async (data) => {
  const created = await driverService.create(partnerId, data);
  setDrivers(prev => [created, ...prev]);
  return created;
};

const updateDriver = async (driverId, data) => {
  const updated = await driverService.update(partnerId, driverId, data);
  setDrivers(prev => prev.map(d => d.userid === updated.userid ? updated : d));
  return updated;
};

const deleteDriver = async (driverId) => {
  await driverService.delete(partnerId, driverId);
  await loadAll();
};

  useEffect(() => {
    if (partnerId) loadAll();
  }, [partnerId, loadAll]);

  return {
    partner,
    upds,
    vehicles,
    drivers,
    loading,
    error,
    addUpd,
    updateUpd,
    deleteUpd,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addDriver,
    updateDriver,
    deleteDriver,
    refetch: loadAll,
  };
};